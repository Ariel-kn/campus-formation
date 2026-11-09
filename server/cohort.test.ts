import { describe, expect, it } from "vitest";
import { isModuleInAuthorizedCohort, modulesForCohort } from "../shared/cohort";

describe("isolation des filières", () => {
  const modules = [
    { id: 1, cohort: "Gestion des médias sociaux" },
    { id: 2, cohort: "Business digital" },
  ];

  it("n’autorise que les modules de la cohorte attribuée", () => {
    expect(isModuleInAuthorizedCohort("Business digital", "Business digital")).toBe(true);
    expect(isModuleInAuthorizedCohort("Business digital", "Gestion des médias sociaux")).toBe(false);
    expect(isModuleInAuthorizedCohort("Gestion des médias sociaux", undefined)).toBe(false);
  });

  it("retourne un parcours entièrement isolé pour chaque filière", () => {
    expect(modulesForCohort(modules, "Business digital").map(module => module.id)).toEqual([2]);
    expect(modulesForCohort(modules, "Gestion des médias sociaux").map(module => module.id)).toEqual([1]);
  });
});
