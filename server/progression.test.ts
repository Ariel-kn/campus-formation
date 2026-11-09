import { describe, expect, it } from "vitest";
import { canAccessModule } from "../shared/progression";

describe("règle de progression", () => {
  it("autorise le premier module", () => {
    expect(canAccessModule({ sequence: 1, firstSequence: 1, predecessorApproved: false })).toBe(true);
  });

  it("bloque un module suivant tant que le précédent n’est pas validé", () => {
    expect(canAccessModule({ sequence: 2, firstSequence: 1, predecessorApproved: false })).toBe(false);
  });

  it("autorise le module suivant après validation formateur", () => {
    expect(canAccessModule({ sequence: 2, firstSequence: 1, predecessorApproved: true })).toBe(true);
  });

  it("respecte un blocage manuel même après validation", () => {
    expect(canAccessModule({ sequence: 2, firstSequence: 1, predecessorApproved: true, override: "locked" })).toBe(false);
  });

  it("autorise un déblocage manuel", () => {
    expect(canAccessModule({ sequence: 4, firstSequence: 1, predecessorApproved: false, override: "unlocked" })).toBe(true);
  });
});
