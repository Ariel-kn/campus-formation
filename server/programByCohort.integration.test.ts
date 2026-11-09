import { afterEach, describe, expect, it } from "vitest";
import { assessments, assignments, assessmentSubmissions, courseModules, deliverables, enrollments, learningResources, lessons, progressOverrides } from "../drizzle/schema";
import { getProgramForStudent, setDbForTests } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function fakeDb() {
  const data = new Map<unknown, any[]>([
    [courseModules, [
      { id: 1, cohort: "Gestion des médias sociaux", sequence: 1, code: "M1", title: "Réseaux sociaux", summary: "", isPublished: true },
      { id: 2, cohort: "Business digital", sequence: 1, code: "BD1", title: "Fondamentaux Business digital", summary: "", isPublished: true },
    ]],
    [enrollments, [{ userId: 90, status: "active", cohort: "Business digital" }]],
    [lessons, []], [assignments, []], [assessments, []], [assessmentSubmissions, []], [progressOverrides, []], [deliverables, []], [learningResources, []],
  ]);
  const chainFor = (table: unknown) => {
    const rows = data.get(table) ?? [];
    const chain: any = {
      where: () => chain,
      orderBy: () => Promise.resolve(rows),
      limit: (count: number) => Promise.resolve(rows.slice(0, count)),
      then: (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject),
    };
    return chain;
  };
  return { select: () => ({ from: (table: unknown) => chainFor(table) }), insert: () => ({ values: () => Promise.resolve() }) } as any;
}

describe("getProgramForStudent — isolation réelle par cohorte", () => {
  afterEach(() => setDbForTests(null));

  it("ne retourne jamais les modules Médias sociaux à un élève Business digital", async () => {
    setDbForTests(fakeDb());
    const program = await getProgramForStudent(90);
    expect(program).toHaveLength(1);
    expect(program[0]).toMatchObject({ id: 2, cohort: "Business digital", code: "BD1" });
    expect(program.some(module => module.cohort === "Gestion des médias sociaux")).toBe(false);
  });

  it("refuse tout parcours à un nouvel inscrit sans affectation active", async () => {
    const chain: any = { where: () => chain, limit: () => Promise.resolve([]) };
    setDbForTests({ select: () => ({ from: (table: unknown) => { expect(table).toBe(enrollments); return chain; } }) } as any);
    await expect(getProgramForStudent(91)).rejects.toThrow("accès à la filière doit être activé");
  });

  it("refuse également la procédure student.program sans inscription active", async () => {
    const chain: any = { where: () => chain, limit: () => Promise.resolve([]) };
    setDbForTests({ select: () => ({ from: () => chain }) } as any);
    const ctx: TrpcContext = { user: { id: 92, openId: "pending-student", name: "Nouveau", email: "nouveau@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
    await expect(appRouter.createCaller(ctx).student.program()).rejects.toThrow("accès à la filière doit être activé");
  });
});
