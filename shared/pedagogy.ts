export function isSubmittedLate(dueAt: Date | null | undefined, submittedAt = new Date()) {
  return Boolean(dueAt && submittedAt > dueAt);
}

export function canSubmitAnotherVersion(existingCount: number, allowed: boolean) {
  return existingCount === 0 || allowed;
}

export function canRequestRetry(allowed: boolean) {
  return allowed;
}

export function canCopyRubric(sourceAssessmentId: number, targetAssessmentId: number) {
  return Number.isInteger(sourceAssessmentId) && Number.isInteger(targetAssessmentId) && sourceAssessmentId > 0 && targetAssessmentId > 0 && sourceAssessmentId !== targetAssessmentId;
}

export function canPublishContent(title: string, summary: string, sequence: number) {
  return title.trim().length >= 3 && summary.trim().length >= 10 && Number.isInteger(sequence) && sequence > 0;
}
