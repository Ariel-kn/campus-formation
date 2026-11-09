import { describe, expect, it } from "vitest";
import { FORMATIVE_SIMULATION_CODE, FORMATIVE_SIMULATION_DURATION_SECONDS, FORMATIVE_THEORY_DURATION_SECONDS, nayaSimulationSteps } from "./simulationSeed";

describe("simulation formative Naya Conseil", () => {
  it("sépare les 30 minutes de théorie de la phase pratique de 1 h 30", () => {
    expect(FORMATIVE_SIMULATION_CODE).toBe("SIM-BD-NAYA-02");
    expect(FORMATIVE_SIMULATION_DURATION_SECONDS).toBe(5_400);
    expect(FORMATIVE_THEORY_DURATION_SECONDS).toBe(1_800);
    expect(FORMATIVE_SIMULATION_DURATION_SECONDS + FORMATIVE_THEORY_DURATION_SECONDS).toBe(7_200);
  });

  it("propose un parcours approfondi en quatre phases et seize décisions", () => {
    expect(nayaSimulationSteps).toHaveLength(16);
    expect(nayaSimulationSteps.map(step => step.sequence)).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
    const titles = nayaSimulationSteps.map(step => step.title).join(" ");
    expect(titles).toContain("Phase 1");
    expect(titles).toContain("Phase 2");
    expect(titles).toContain("Phase 3");
    expect(titles).toContain("Phase 4");
  });

  it("évite les choix trop prévisibles et couvre des arbitrages réels", () => {
    for (const step of nayaSimulationSteps) {
      expect(step.choices).toHaveLength(3);
      const labels = step.choices.map(choice => choice.label);
      expect(new Set(labels).size).toBe(3);
      expect(new Set(step.choices.map(choice => choice.score)).size).toBeGreaterThan(1);
      for (const choice of step.choices) {
        expect(choice.label.length).toBeGreaterThan(35);
        expect(choice.consequence.length).toBeGreaterThan(45);
        expect(choice.feedback.length).toBeGreaterThan(45);
        expect(choice.score).toBeGreaterThanOrEqual(0);
        expect(choice.score).toBeLessThanOrEqual(10);
        expect(Object.keys(choice.metrics).sort()).toEqual(["budget", "engagement", "prospects", "satisfaction", "visibility"]);
      }
    }
  });
});
