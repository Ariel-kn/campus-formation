import { afterEach, describe, expect, it } from "vitest";
import { enrollments } from "../drizzle/schema";
import { getExactCourseSource } from "../client/src/data/exactCourseSources";
import { INTAKE_ONE, INTAKE_TWO } from "../shared/cohort";
import { requestStudentEnrollment, setDbForTests } from "./db";

describe("rentrées de formation", () => {
  afterEach(() => setDbForTests(null));

  it("enregistre la rentrée demandée avec la filière, en attente de validation", async () => {
    const chain: any = { where: () => chain, limit: () => Promise.resolve([]) };
    let inserted: any;
    setDbForTests({
      select: () => ({ from: (table: unknown) => { expect(table).toBe(enrollments); return chain; } }),
      insert: () => ({ values: (value: any) => ({ onDuplicateKeyUpdate: ({ set }: any) => { inserted = { value, set }; } }) }),
    } as any);

    await requestStudentEnrollment({ userId: 801, cohort: "Gestion des médias sociaux", intake: INTAKE_TWO });
    expect(inserted.value).toMatchObject({ userId: 801, status: "suspended", cohort: "Gestion des médias sociaux", intake: INTAKE_TWO });
    expect(inserted.set).toMatchObject({ cohort: "Gestion des médias sociaux", intake: INTAKE_TWO });
  });

  it("conserve la rentrée 1 comme valeur historique par défaut", () => {
    expect(INTAKE_ONE).toBe("Rentrée 1 — Septembre 2026");
  });

  it("sert les transcriptions complètes dédiées à la rentrée 2", () => {
    expect(getExactCourseSource("PREC", 1, INTAKE_TWO)?.url).toContain("precours-r2-parcours-a_");
    expect(getExactCourseSource("PREC", 2, INTAKE_TWO)?.url).toContain("precours-r2-parcours-b_");
    expect(getExactCourseSource("PREC", 1, INTAKE_ONE)?.url).toContain("precours-gms-parcours-a_");
  });
});
