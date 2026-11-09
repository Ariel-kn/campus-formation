export type CohortName = "Gestion des médias sociaux" | "Business digital";

export const INTAKE_ONE = "Rentrée 1 — Septembre 2026" as const;
export const INTAKE_TWO = "Rentrée 2 — Novembre 2026" as const;
export type IntakeName = typeof INTAKE_ONE | typeof INTAKE_TWO;
export const intakeNames = [INTAKE_ONE, INTAKE_TWO] as const;

export function isModuleInAuthorizedCohort(moduleCohort: string | null | undefined, studentCohort: string | null | undefined) {
  return Boolean(moduleCohort && studentCohort && moduleCohort === studentCohort);
}

export function modulesForCohort<T extends { cohort: string }>(modules: T[], cohort: string) {
  return modules.filter(module => isModuleInAuthorizedCohort(module.cohort, cohort));
}
