import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { detailedCourseContent } from "./courseContent";
import { curriculum } from "./courseSeed";
import { businessDigitalCurriculum } from "./businessDigitalSeed";

describe("supports de cours détaillés", () => {
  it("propose un support concret pour chaque module des deux filières", () => {
    expect([...curriculum, ...businessDigitalCurriculum].every(module => detailedCourseContent[module.code]?.length > 250)).toBe(true);
  });

  it("préserve une filière Business digital sans contenu e-commerce", () => {
    expect(businessDigitalCurriculum.every(module => !detailedCourseContent[module.code].toLowerCase().includes("e-commerce"))).toBe(true);
  });

  it("référence uniquement le manuel Business Digital autorisé dans la vue des leçons", () => {
    const home = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("manuel-business-digital-sans-ecommerce");
    expect(home).not.toContain("Manuel_Detaille_Business_Digital");
  });
});
