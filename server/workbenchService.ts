import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  appNotifications,
  enrollments,
  formativeSimulationAttempts as copies,
  formativeSimulations as simulations,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";
import { workshops, getWorkshopsForCohort } from "../shared/simulationWorkshops";
import {
  INITIAL_WORK_METRICS,
  PRACTICE_SECONDS,
  WORKBENCH_CODE,
  answerKeys,
  completeness,
  type WorkAnswer,
  type WorkState,
} from "../shared/simulationWorkbench";
import {
  evaluateWorkshop,
  workshopForState,
  workbenchObjectiveMax,
} from "./workbenchEngine";
import { createHeartbeatJob, updateHeartbeatJob } from "./_core/heartbeat";

export const emptyWorkState = (): WorkState => ({ version: 3, records: {} });
export function readWorkState(value: unknown): WorkState {
  const v = value as WorkState;
  return v?.version === 3 && v.records ? v : emptyWorkState();
}
export function remainingWorkSeconds(startedAt: Date | null, now = Date.now()) {
  return startedAt
    ? Math.max(
        0,
        Math.ceil((startedAt.getTime() + PRACTICE_SECONDS * 1000 - now) / 1000)
      )
    : PRACTICE_SECONDS;
}
async function database() {
  const db = await getDb();
  if (!db)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Base de données indisponible.",
    });
  return db;
}
export async function ensureWorkbench(cohort: string = "Business digital") {
  const db = await database();
  const code = cohort === "Gestion des médias sociaux" ? "SIM-GMS-SOMMATIF-01" : WORKBENCH_CODE;
  const title = cohort === "Gestion des médias sociaux"
    ? "Gestion des médias sociaux · Épreuve sommative pratique"
    : "Business digital · Épreuve sommative pratique";
  const description = cohort === "Gestion des médias sociaux"
    ? "4 sections pratiques guidées : ligne éditoriale, campagnes payantes, modération & message vocal, data reporting."
    : "6 sections guidées multi-formats : diagnostic, classement, texte à trous, budget, calculs, échanges client et recommandation.";
  await db
    .insert(simulations)
    .values({
      code,
      cohort,
      title,
      description,
      durationSeconds: PRACTICE_SECONDS,
      isPublished: true,
    })
    .onDuplicateKeyUpdate({ set: { code, durationSeconds: PRACTICE_SECONDS, isPublished: true } });
  const [simulation] = await db
    .select()
    .from(simulations)
    .where(eq(simulations.code, code))
    .limit(1);
  return simulation;
}
async function authorizeStudent(studentId: number) {
  const db = await database();
  const [e] = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.userId, studentId))
    .limit(1);
  if (e?.status !== "active")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Ateliers réservés aux apprenants autorisés par le formateur.",
    });
  const cohort = e.cohort || "Business digital";
  const simulation = await ensureWorkbench(cohort);
  if (!simulation.isPublished)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "L’épreuve sommative pratique est verrouillée par le formateur.",
    });
  return { simulation, cohort };
}
async function notify(tx: any, studentId: number, expired: boolean) {
  const admins = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"));
  const [student] = await tx
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);
  if (admins.length)
    await tx.insert(appNotifications).values(
      admins.map((a: { id: number }) => ({
        userId: a.id,
        type: "system" as const,
        title: expired
          ? "Épreuve pratique clôturée à l’échéance"
          : "Épreuve pratique remise",
        body: `${student?.name || "Un apprenant"} : ${expired ? "le délai de 1 h 30 est terminé, la copie enregistrée est verrouillée" : "les ateliers et échanges sont disponibles pour correction"}.`,
        link: "simulations",
      }))
    );
}
export async function expireWorkbenchCopies(simulationId?: number) {
  const db = await database();
  const simulation = simulationId ? null : await ensureWorkbench();
  const id = simulationId ?? simulation!.id;
  return db.transaction(async tx => {
    const rows = await tx
      .select()
      .from(copies)
      .where(and(eq(copies.simulationId, id), eq(copies.status, "draft")))
      .for("update");
    let expired = 0;
    for (const row of rows)
      if (row.startedAt && remainingWorkSeconds(row.startedAt) === 0) {
        const deadline = new Date(
          row.startedAt.getTime() + PRACTICE_SECONDS * 1000
        );
        await tx
          .update(copies)
          .set({ status: "expired", submittedAt: deadline })
          .where(eq(copies.id, row.id));
        await notify(tx, row.studentId, true);
        expired++;
      }
    return { expired };
  });
}
function publicState(copy: typeof copies.$inferSelect | undefined) {
  if (!copy) return null;
  const state = readWorkState(copy.responses);
  // Aucun corrigé, score d’étape ni règle du correcteur transmis à l’apprenant.
  return {
    id: copy.id,
    status: copy.status,
    currentStep: copy.currentStep,
    startedAt: copy.startedAt?.getTime() ?? null,
    deadlineAt: copy.startedAt
      ? copy.startedAt.getTime() + PRACTICE_SECONDS * 1000
      : null,
    submittedAt: copy.submittedAt?.getTime() ?? null,
    lastSavedAt: copy.lastSavedAt.getTime(),
    metrics: copy.metrics,
    records: Object.fromEntries(
      Object.entries(state.records).map(([id, r]) => [
        id,
        {
          answer: r.answer,
          committed: r.committed,
          consequence: r.committed ? r.consequence : "",
        },
      ])
    ),
    review: state.review
      ? { score: state.review.score, feedback: state.review.feedback }
      : null,
  };
}
export async function getWorkbenchStudent(studentId: number) {
  const { simulation, cohort } = await authorizeStudent(studentId);
  await expireWorkbenchCopies(simulation.id);
  const db = await database();
  const [copy] = await db
    .select()
    .from(copies)
    .where(
      and(
        eq(copies.simulationId, simulation.id),
        eq(copies.studentId, studentId)
      )
    )
    .limit(1);
  const state = readWorkState(copy?.responses);
  const cohortWorkshops = getWorkshopsForCohort(cohort);
  return {
    simulation: { id: simulation.id, title: simulation.title },
    workshops: cohortWorkshops.map(w => workshopForState(w, state)),
    attempt: publicState(copy),
    remainingSeconds: copy
      ? remainingWorkSeconds(
          copy.startedAt,
          copy.status !== "draft"
            ? (copy.submittedAt?.getTime() ?? Date.now())
            : Date.now()
        )
      : PRACTICE_SECONDS,
    serverNow: Date.now(),
  };
}
export async function startWorkbench(studentId: number) {
  const { simulation } = await authorizeStudent(studentId);
  const db = await database();
  await db
    .insert(copies)
    .values({
      simulationId: simulation.id,
      studentId,
      startedAt: new Date(),
      responses: emptyWorkState() as unknown as Record<string, unknown>,
      metrics: INITIAL_WORK_METRICS,
    })
    .onDuplicateKeyUpdate({ set: { studentId } });
  return getWorkbenchStudent(studentId);
}
export async function saveWorkbench(input: {
  studentId: number;
  workshopId: string;
  answer: WorkAnswer;
  commit: boolean;
}) {
  const { simulation, cohort } = await authorizeStudent(input.studentId);
  const db = await database();
  await startWorkbench(input.studentId);
  return db.transaction(async tx => {
    const [copy] = await tx
      .select()
      .from(copies)
      .where(
        and(
          eq(copies.simulationId, simulation.id),
          eq(copies.studentId, input.studentId)
        )
      )
      .for("update");
    if (copy.status !== "draft" || remainingWorkSeconds(copy.startedAt) === 0)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Le temps est écoulé ou la copie est déjà remise.",
      });
    const cohortWorkshops = getWorkshopsForCohort(cohort);
    const original = cohortWorkshops[copy.currentStep] || workshops[copy.currentStep];
    if (!original || original.id !== input.workshopId)
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "Cette étape a déjà été validée. Actualisez la copie avant de continuer.",
      });
    const state = readWorkState(copy.responses);
    const workshop = workshopForState(original, state);
    const allowed = new Set(
      workshop.tasks.flatMap(t => [
        ...answerKeys(t),
        ...answerKeys(t).map(k => `_sent:${k}`),
      ])
    );
    const answer = Object.fromEntries(
      Object.entries(input.answer).filter(([k]) => allowed.has(k))
    );
    if (input.commit) {
      const errors = completeness(workshop, answer);
      if (errors.length)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errors.slice(0, 3).join(" "),
        });
    }
    const result = input.commit
      ? evaluateWorkshop(workshop, answer)
      : {
          objectiveScore: 0,
          objectiveMax: 0,
          manualPending: false,
          consequence: "",
          metrics: {},
        };
    state.records[workshop.id] = {
      answer,
      committed: input.commit,
      objectiveScore: result.objectiveScore,
      objectiveMax: result.objectiveMax,
      manualPending: result.manualPending,
      consequence: result.consequence,
      at: new Date().toISOString(),
    };
    const metrics = { ...copy.metrics };
    if (input.commit)
      for (const [k, delta] of Object.entries(result.metrics)) {
        const key = k as keyof typeof metrics;
        metrics[key] = Math.max(0, metrics[key] + (delta || 0));
        if (["visibility", "engagement", "satisfaction"].includes(key))
          metrics[key] = Math.min(100, metrics[key]);
      }
    await tx
      .update(copies)
      .set({
        responses: state as unknown as Record<string, unknown>,
        currentStep: copy.currentStep + (input.commit ? 1 : 0),
        score: Object.values(state.records).reduce(
          (s, r) => s + r.objectiveScore,
          0
        ),
        metrics,
        lastSavedAt: new Date(),
      })
      .where(eq(copies.id, copy.id));
  });
  return getWorkbenchStudent(input.studentId);
}
export async function submitWorkbench(studentId: number) {
  const simulation = await authorizeStudent(studentId);
  const db = await database();
  await db.transaction(async tx => {
    const [copy] = await tx
      .select()
      .from(copies)
      .where(
        and(
          eq(copies.simulationId, simulation.id),
          eq(copies.studentId, studentId)
        )
      )
      .for("update");
    if (!copy || copy.status !== "draft") return;
    const expired = remainingWorkSeconds(copy.startedAt) === 0;
    await tx
      .update(copies)
      .set({
        status: expired ? "expired" : "submitted",
        submittedAt:
          expired && copy.startedAt
            ? new Date(copy.startedAt.getTime() + PRACTICE_SECONDS * 1000)
            : new Date(),
      })
      .where(eq(copies.id, copy.id));
    await notify(tx, studentId, expired);
  });
  return getWorkbenchStudent(studentId);
}
export async function getWorkbenchAdmin() {
  const simulation = await ensureWorkbench();
  await expireWorkbenchCopies(simulation.id);
  const db = await database();
  const attempts = await db
    .select()
    .from(copies)
    .where(eq(copies.simulationId, simulation.id))
    .orderBy(desc(copies.lastSavedAt));
  const students = attempts.length
    ? await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          inArray(
            users.id,
            attempts.map(a => a.studentId)
          )
        )
    : [];
  return {
    simulation,
    workshops,
    objectiveMax: workbenchObjectiveMax,
    attempts: attempts.map(a => ({
      ...a,
      state: readWorkState(a.responses),
      receivedWorkshops: workshops.map(w =>
        workshopForState(w, readWorkState(a.responses))
      ),
      student: students.find(s => s.id === a.studentId),
      remainingSeconds: remainingWorkSeconds(a.startedAt),
    })),
  };
}
export async function reviewWorkbench(input: {
  attemptId: number;
  score: number;
  feedback: string;
  actorId: number;
}) {
  const db = await database();
  const simulation = await ensureWorkbench();
  await db.transaction(async tx => {
    const [copy] = await tx
      .select()
      .from(copies)
      .where(
        and(
          eq(copies.id, input.attemptId),
          eq(copies.simulationId, simulation.id)
        )
      )
      .for("update");
    if (!copy || copy.status === "draft")
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Seules les copies remises peuvent être corrigées.",
      });
    const state = readWorkState(copy.responses);
    state.review = {
      score: input.score,
      feedback: input.feedback,
      actorId: input.actorId,
      at: new Date().toISOString(),
    };
    await tx
      .update(copies)
      .set({ responses: state as unknown as Record<string, unknown> })
      .where(eq(copies.id, copy.id));
    await tx.insert(appNotifications).values({
      userId: copy.studentId,
      type: "review",
      title: "Correction de votre épreuve pratique",
      body: `Votre note est de ${input.score}/20. Consultez le commentaire du formateur.`,
      link: "simulations",
    });
  });
  return { ok: true };
}
export async function setWorkbenchPublished(isPublished: boolean) {
  const db = await database();
  const s = await ensureWorkbench();
  await db
    .update(simulations)
    .set({ isPublished })
    .where(eq(simulations.id, s.id));
  return { ok: true };
}
export async function enableWorkbenchHeartbeat(sessionToken: string) {
  const db = await database();
  const s = await ensureWorkbench();
  if (s.scheduleCronTaskUid) {
    await updateHeartbeatJob(
      s.scheduleCronTaskUid,
      { enable: true },
      sessionToken
    );
    return { ok: true };
  }
  const result = await createHeartbeatJob(
    {
      name: `cloture-${WORKBENCH_CODE}`,
      cron: "0 * * * * *",
      path: "/api/scheduled/simulation-expiry",
      description:
        "Clôture des épreuves pratiques expirées même si l’apprenant a fermé son navigateur (contrôle chaque minute).",
    },
    sessionToken
  );
  await db
    .update(simulations)
    .set({ scheduleCronTaskUid: result.taskUid })
    .where(eq(simulations.id, s.id));
  return { ok: true };
}
export async function runWorkbenchHeartbeat(taskUid: string) {
  const db = await database();
  const [s] = await db
    .select()
    .from(simulations)
    .where(eq(simulations.scheduleCronTaskUid, taskUid))
    .limit(1);
  return s ? expireWorkbenchCopies(s.id) : { expired: 0, skipped: "orphan" };
}
