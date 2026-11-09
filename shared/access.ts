export function isEnrollmentAuthorized(enrollment?: { status?: "active" | "suspended" } | null) {
  return enrollment?.status === "active";
}
