export type ProgressOverride = "locked" | "unlocked" | undefined;

export function canAccessModule(input: {
  sequence: number;
  firstSequence: number;
  predecessorApproved: boolean;
  override?: ProgressOverride;
}) {
  if (input.override === "locked") return false;
  if (input.override === "unlocked") return true;
  if (input.sequence === input.firstSequence) return true;
  return input.predecessorApproved;
}

export function accessExplanation(input: {
  isUnlocked: boolean;
  override?: ProgressOverride;
  predecessorApproved: boolean;
}) {
  if (input.override === "locked") {
    return "Accès bloqué manuellement par le formateur.";
  }
  if (input.override === "unlocked") {
    return "Accès débloqué manuellement par le formateur.";
  }
  if (input.isUnlocked) {
    return "Module accessible.";
  }
  if (!input.predecessorApproved) {
    return "Terminez puis faites valider l’évaluation du module précédent pour continuer.";
  }
  return "Module actuellement indisponible.";
}
