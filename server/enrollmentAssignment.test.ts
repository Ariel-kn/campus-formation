import { afterEach, describe, expect, it } from "vitest";
import { enrollments } from "../drizzle/schema";
import { setDbForTests, setStudentEnrollment } from "./db";

describe("affectation obligatoire de filière", () => {
  afterEach(() => setDbForTests(null));

  it("refuse d’autoriser un nouvel inscrit tant qu’aucune filière n’a été sélectionnée", async () => {
    const chain: any = { where: () => chain, limit: () => Promise.resolve([]) };
    setDbForTests({ select: () => ({ from: (table: unknown) => { expect(table).toBe(enrollments); return chain; } }) } as any);
    await expect(setStudentEnrollment({ userId: 700, status: "active" })).rejects.toThrow("Choisissez d’abord une filière");
  });

  it("enregistre la filière transmise au moment de l’autorisation", async () => {
    const chain: any = { where: () => chain, limit: () => Promise.resolve([]) };
    let inserted: any;
    setDbForTests({
      select: () => ({ from: () => chain }),
      insert: () => ({ values: (value: any) => ({ onDuplicateKeyUpdate: ({ set }: any) => { inserted = { value, set }; } }) }),
    } as any);
    await setStudentEnrollment({ userId: 701, status: "active", cohort: "Business digital" });
    expect(inserted.value).toMatchObject({ userId: 701, status: "active", cohort: "Business digital" });
    expect(inserted.set).toMatchObject({ status: "active", cohort: "Business digital" });
  });
});
