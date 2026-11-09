import { beforeEach, describe, expect, it, vi } from "vitest";
const mem = vi.hoisted(() => ({
  tables: {} as Record<string, any[]>,
  now: new Date("2026-10-29T12:00:00Z"),
}));
vi.mock("drizzle-orm", async original => {
  const actual = await original<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (col: any, value: any) => ({ op: "eq", key: col.name, value }),
    and: (...terms: any[]) => ({ op: "and", terms }),
    inArray: (col: any, values: any[]) => ({ op: "in", key: col.name, values }),
    asc: () => null,
    desc: () => null,
  };
});
vi.mock("./db", () => ({ getDb: async () => fakeDb }));
vi.mock("./_core/heartbeat", () => ({
  createHeartbeatJob: vi.fn(async () => ({ taskUid: "test-cron" })),
  updateHeartbeatJob: vi.fn(),
}));
import { getTableName } from "drizzle-orm";
import {
  getWorkbenchStudent,
  saveWorkbench,
  startWorkbench,
  submitWorkbench,
  expireWorkbenchCopies,
  remainingWorkSeconds,
  reviewWorkbench,
  runWorkbenchHeartbeat,
} from "./workbenchService";
import { workshops } from "../shared/simulationWorkshops";
import {
  PRACTICE_SECONDS,
  INITIAL_WORK_METRICS,
  type WorkAnswer,
} from "../shared/simulationWorkbench";
import { sampleAnswers } from "./workbenchEngine";

function matches(row: any, cond: any): boolean {
  if (!cond) return true;
  if (cond.op === "and") return cond.terms.every((c: any) => matches(row, c));
  const key =
    cond.key === "simulationAttemptStatus"
      ? "status"
      : cond.key === "schedule_cron_task_uid"
        ? "scheduleCronTaskUid"
        : cond.key;
  return cond.op === "in"
    ? cond.values.includes(row[key])
    : row[key] === cond.value;
}
function table(t: any) {
  const name = getTableName(t);
  return mem.tables[name] ?? (mem.tables[name] = []);
}
const fakeDb: any = {
  select: () => {
    let source: any[] = [];
    let cond: any;
    let limit = Infinity;
    const q: any = {
      from: (t: any) => {
        source = table(t);
        return q;
      },
      where: (c: any) => {
        cond = c;
        return q;
      },
      limit: (n: number) => {
        limit = n;
        return q;
      },
      orderBy: () => q,
      for: () => q,
      then: (resolve: any, reject: any) =>
        Promise.resolve(
          source
            .filter(r => matches(r, cond))
            .slice(0, limit)
            .map(r => ({ ...r }))
        ).then(resolve, reject),
    };
    return q;
  },
  insert: (t: any) => ({
    values: (data: any) => {
      const rows = Array.isArray(data) ? data : [data];
      const run = (dedupe = false) => {
        const target = table(t);
        for (const row of rows) {
          const exists =
            dedupe &&
            target.some(r =>
              row.code
                ? r.code === row.code
                : row.simulationId
                  ? r.simulationId === row.simulationId &&
                    r.studentId === row.studentId
                  : false
            );
          if (exists) continue;
          target.push({
            id: target.length + 1,
            status: "draft",
            currentStep: 0,
            score: 0,
            submittedAt: null,
            lastSavedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            scheduleCronTaskUid: null,
            ...row,
          });
        }
        return Promise.resolve();
      };
      return {
        onDuplicateKeyUpdate: () => run(true),
        then: (r: any, e: any) => run().then(r, e),
      };
    },
  }),
  update: (t: any) => ({
    set: (patch: any) => ({
      where: async (cond: any) => {
        for (const row of table(t))
          if (matches(row, cond)) Object.assign(row, patch);
      },
    }),
  }),
  transaction: async (fn: any) => fn(fakeDb),
};
function simulation() {
  return mem.tables.formative_simulations[0];
}
function copy() {
  return mem.tables.formative_simulation_attempts?.[0];
}
function open() {
  simulation().isPublished = true;
}
function cloneAnswer(id: string): WorkAnswer {
  return { ...sampleAnswers[id] };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(mem.now);
  mem.tables = {
    formative_simulations: [
      {
        id: 1,
        code: "SIM-BD-NAYA-04",
        cohort: "Business digital",
        title: "Naya",
        description: "test",
        durationSeconds: PRACTICE_SECONDS,
        isPublished: true,
        scheduleCronTaskUid: null,
      },
    ],
    enrollments: [{ userId: 2, status: "active", cohort: "Business digital" }],
    users: [
      { id: 1, role: "admin", name: "Formateur" },
      { id: 2, role: "user", name: "Apprenante" },
    ],
    formative_simulation_attempts: [],
    app_notifications: [],
  };
});

describe("épreuve pratique V4 — service", () => {
  it("refuse une filière différente, une inscription inactive et une épreuve verrouillée", async () => {
    mem.tables.enrollments[0].cohort = "Gestion des médias sociaux";
    await expect(getWorkbenchStudent(2)).rejects.toThrow("réservés");
    mem.tables.enrollments[0].cohort = "Business digital";
    mem.tables.enrollments[0].status = "suspended";
    await expect(startWorkbench(2)).rejects.toThrow("réservés");
    mem.tables.enrollments[0].status = "active";
    simulation().isPublished = false;
    await expect(startWorkbench(2)).rejects.toThrow("verrouillée");
  });
  it("ne démarre pas à la lecture et démarre une seule fois à la première réponse", async () => {
    const read = await getWorkbenchStudent(2);
    expect(read.attempt).toBeNull();
    expect(read.remainingSeconds).toBe(5400);
    await startWorkbench(2);
    const first = copy().startedAt.getTime();
    vi.advanceTimersByTime(180000);
    await startWorkbench(2);
    expect(copy().startedAt.getTime()).toBe(first);
    expect((await getWorkbenchStudent(2)).remainingSeconds).toBe(5220);
  });
  it("enregistre une réponse incomplète sans la valider ni attribuer des points", async () => {
    const w = workshops[0];
    const result = await saveWorkbench({
      studentId: 2,
      workshopId: w.id,
      answer: { "diag-ecrit-diagnostic": "Un début de rédaction" },
      commit: false,
    });
    expect(result.attempt?.records[w.id].answer["diag-ecrit-diagnostic"]).toBe(
      "Un début de rédaction"
    );
    expect(copy().currentStep).toBe(0);
    expect(copy().score).toBe(0);
  });
  it("refuse une validation vide mais accepte les réponses complètes incorrectes", async () => {
    const w = workshops[0];
    await expect(
      saveWorkbench({
        studentId: 2,
        workshopId: w.id,
        answer: {},
        commit: true,
      })
    ).rejects.toThrow("complétez");
    const a = cloneAnswer(w.id);
    for (const t of w.tasks)
      if (t.kind === "numeric") for (const f of t.fields) a[f.id] = "999";
    await saveWorkbench({
      studentId: 2,
      workshopId: w.id,
      answer: a,
      commit: true,
    });
    expect(copy().currentStep).toBe(1);
    expect(copy().status).toBe("draft");
  });
  it("empêche une double validation ou une réécriture de l’atelier précédent", async () => {
    const w = workshops[0];
    const a = cloneAnswer(w.id);
    await saveWorkbench({
      studentId: 2,
      workshopId: w.id,
      answer: a,
      commit: true,
    });
    const score = copy().score;
    await expect(
      saveWorkbench({ studentId: 2, workshopId: w.id, answer: a, commit: true })
    ).rejects.toThrow("déjà été validée");
    expect(copy().score).toBe(score);
  });
  it("verrouille à 90 minutes et notifie une seule fois même sans remise manuelle", async () => {
    await startWorkbench(2);
    vi.advanceTimersByTime(PRACTICE_SECONDS * 1000);
    await expireWorkbenchCopies();
    await expireWorkbenchCopies();
    expect(copy().status).toBe("expired");
    expect(mem.tables.app_notifications).toHaveLength(1);
    await expect(
      saveWorkbench({
        studentId: 2,
        workshopId: workshops[0].id,
        answer: {},
        commit: false,
      })
    ).rejects.toThrow("déjà remise");
    expect(copy().submittedAt.getTime()).toBe(mem.now.getTime() + 5400000);
  });
  it("permet la remise explicite d’un brouillon et interdit les modifications ultérieures", async () => {
    await saveWorkbench({
      studentId: 2,
      workshopId: workshops[0].id,
      answer: { x: "ignored" },
      commit: false,
    });
    await submitWorkbench(2);
    await submitWorkbench(2);
    expect(copy().status).toBe("submitted");
    expect(mem.tables.app_notifications).toHaveLength(1);
    await expect(
      saveWorkbench({
        studentId: 2,
        workshopId: workshops[0].id,
        answer: {},
        commit: false,
      })
    ).rejects.toThrow("déjà remise");
  });
  it("réserve la correction aux copies remises et publie la note manuelle", async () => {
    await startWorkbench(2);
    await expect(
      reviewWorkbench({
        attemptId: 1,
        score: 12,
        feedback: "À approfondir",
        actorId: 1,
      })
    ).rejects.toThrow("remises");
    await submitWorkbench(2);
    await reviewWorkbench({
      attemptId: 1,
      score: 14.5,
      feedback: "Bonne analyse du parcours",
      actorId: 1,
    });
    const r = await getWorkbenchStudent(2);
    expect(r.attempt?.review?.score).toBe(14.5);
    expect(r.attempt?.review?.feedback).toContain("Bonne analyse");
  });
  it("ignore un callback cron sans ligne propriétaire et traite le bon taskUid", async () => {
    await startWorkbench(2);
    vi.advanceTimersByTime(5400000);
    expect(await runWorkbenchHeartbeat("orphan")).toMatchObject({
      skipped: "orphan",
    });
    expect(copy().status).toBe("draft");
    simulation().scheduleCronTaskUid = "scheduled";
    await runWorkbenchHeartbeat("scheduled");
    expect(copy().status).toBe("expired");
  });
  it("calcule l’échéance depuis le démarrage absolu, sans réinitialisation", () => {
    expect(remainingWorkSeconds(null)).toBe(5400);
    expect(remainingWorkSeconds(new Date(mem.now.getTime() - 5399000))).toBe(1);
    expect(remainingWorkSeconds(new Date(mem.now.getTime() - 5401000))).toBe(0);
  });
});
