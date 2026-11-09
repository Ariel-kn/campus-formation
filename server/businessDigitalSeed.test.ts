import { describe, expect, it } from "vitest";
import { BUSINESS_DIGITAL_COHORT, businessDigitalCurriculum } from "./businessDigitalSeed";

describe("programme Business digital", () => {
  it("respecte les six modules de formation puis l’épreuve sommative", () => {
    expect(BUSINESS_DIGITAL_COHORT).toBe("Business digital");
    expect(businessDigitalCurriculum).toHaveLength(7);
    expect(businessDigitalCurriculum.map(module => module.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(businessDigitalCurriculum.map(module => module.code)).toEqual(["BD1", "BD2", "BD3", "BD4", "BD5", "BD6", "BD7"]);
  });

  it("contient une épreuve sommative théorique et pratique de 2 heures sur 20 points", () => {
    const summative = businessDigitalCurriculum.find(module => module.code === "BD7");
    expect(summative?.assessment.title).toContain("sommative");
    expect(summative?.assessment.instructions).toContain("2 heures");
    expect(summative?.assessment.questions.filter(question => question.type !== "essay")).toHaveLength(10);
    expect(summative?.assessment.questions.filter(question => question.type === "essay")).toHaveLength(1);
    expect(summative?.assessment.questions.reduce((total, question) => total + question.maxPoints, 0)).toBe(20);
    expect(summative?.assessment.questions.at(-1)?.prompt).toContain("Naya Conseil");
  });

  it("réserve 30 minutes à la théorie et utilise des distracteurs de niveau professionnel", () => {
    const summative = businessDigitalCurriculum.find(module => module.code === "BD7");
    expect(summative?.assessment.instructions).toContain("30 minutes");
    expect(summative?.assessment.instructions).toContain("1 h 30");
    const qcm = summative?.assessment.questions.filter(question => question.type !== "essay") ?? [];
    for (const question of qcm) {
      expect(question.options).toHaveLength(3);
      expect(question.prompt.length).toBeGreaterThan(100);
      expect(question.options?.every(option => option.length > 70)).toBe(true);
    }
  });

  it("n’intègre aucune notion de boutique, paiement, logistique ou e-commerce", () => {
    const searchable = businessDigitalCurriculum.flatMap(module => [
      module.title, module.summary, module.assignment.title, module.assignment.instructions,
      ...module.lessons.flatMap(lesson => [lesson.title, lesson.summary]),
      ...module.assessment.questions.map(question => question.prompt),
    ]).join(" ").toLowerCase();
    for (const forbidden of ["e-commerce", "boutique", "panier", "paiement", "logistique", "catalogue produit", "livraison"]) {
      expect(searchable).not.toContain(forbidden);
    }
  });
});
