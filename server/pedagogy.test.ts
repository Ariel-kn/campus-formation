import { describe, expect, it } from "vitest";
import { canCopyRubric, canPublishContent, canRequestRetry, canSubmitAnotherVersion, isSubmittedLate } from "../shared/pedagogy";

describe("règles de reprise et de retard", () => {
  it("identifie une remise après la date limite", () => {
    expect(isSubmittedLate(new Date("2026-08-17T09:00:00Z"), new Date("2026-08-17T09:01:00Z"))).toBe(true);
    expect(isSubmittedLate(new Date("2026-08-17T09:00:00Z"), new Date("2026-08-17T08:59:00Z"))).toBe(false);
  });

  it("applique les options de nouvelle version et de reprise", () => {
    expect(canSubmitAnotherVersion(0, false)).toBe(true);
    expect(canSubmitAnotherVersion(1, false)).toBe(false);
    expect(canSubmitAnotherVersion(1, true)).toBe(true);
    expect(canRequestRetry(false)).toBe(false);
    expect(canRequestRetry(true)).toBe(true);
  });

  it("valide les opérations de contenu et de copie de barème attendues par le formateur", () => {
    expect(canPublishContent("Module éditorial", "Une description suffisamment détaillée pour les élèves.", 4)).toBe(true);
    expect(canPublishContent("", "Trop court", 0)).toBe(false);
    expect(canCopyRubric(3, 7)).toBe(true);
    expect(canCopyRubric(3, 3)).toBe(false);
  });
});
