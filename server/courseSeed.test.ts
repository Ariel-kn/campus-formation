import { describe, expect, it } from "vitest";
import { curriculum } from "./courseSeed";

describe("programme Gestion des médias sociaux", () => {
  it("couvre le précours et les dix modules professionnels dans un ordre unique", () => {
    expect(curriculum).toHaveLength(11);
    expect(curriculum.map(module => module.code)).toEqual([
      "PREC", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10",
    ]);
    expect(curriculum.map(module => module.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("associe un livrable et une évaluation complète à chaque étape", () => {
    for (const module of curriculum) {
      expect(module.assignment.title).not.toHaveLength(0);
      expect(module.assessment.questions.length).toBeGreaterThanOrEqual(6);
      expect(module.assessment.questions.some(question => question.type === "essay")).toBe(true);
    }
  });
});
