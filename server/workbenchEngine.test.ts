import { describe, expect, it } from "vitest";
import {
  completeness,
  type WorkAnswer,
  type WorkState,
} from "@shared/simulationWorkbench";
import { workshops } from "@shared/simulationWorkshops";
import {
  evaluateWorkshop,
  sampleAnswers,
  workshopForState,
  workbenchObjectiveMax,
} from "./workbenchEngine";

const allTasks = workshops.flatMap(workshop => workshop.tasks);
const answerFor = (workshopId: string): WorkAnswer =>
  sampleAnswers[workshopId] ?? {};

function countFields(): number {
  return allTasks.reduce((total, task) => {
    if (task.kind === "dialogue") return total + task.turns.length;
    if (
      task.kind === "writing" ||
      task.kind === "numeric" ||
      task.kind === "budget"
    )
      return total + task.fields.length;
    return total + task.slots.length;
  }, 0);
}

function stateWith(score: number, max = 10): WorkState {
  return {
    version: 3,
    records: {
      previous: {
        answer: {},
        committed: true,
        objectiveScore: score,
        objectiveMax: max,
        manualPending: false,
        consequence: "",
        at: "2026-10-29T00:00:00.000Z",
      },
    },
  };
}

describe("workbench Business Digital hors e-commerce", () => {
  it("publie exactement 6 sections pour 90 minutes", () => {
    expect(workshops).toHaveLength(6);
    expect(workshops.map(workshop => workshop.minutes)).toEqual([
      15, 15, 15, 15, 15, 15,
    ]);
    expect(workshops.reduce((sum, workshop) => sum + workshop.minutes, 0)).toBe(
      90
    );
  });

  it("propose un volume de saisie raisonnable, varie les tâches et exige une production écrite substantielle", () => {
    expect(countFields()).toBeGreaterThanOrEqual(60);
    expect(new Set(allTasks.map(task => task.kind))).toEqual(
      new Set([
        "placement",
        "cloze",
        "ordering",
        "numeric",
        "budget",
        "writing",
        "dialogue",
      ])
    );
    const minimumWords = allTasks.reduce((total, task) => {
      if (task.kind === "dialogue")
        return total + task.turns.reduce((sum, turn) => sum + turn.minWords, 0);
      if (task.kind === "writing")
        return (
          total +
          task.fields.reduce((sum, field) => sum + (field.minWords ?? 1), 0)
        );
      return total;
    }, 0);
    expect(minimumWords).toBeGreaterThanOrEqual(450);
    expect(minimumWords).toBeLessThanOrEqual(1500);
    expect(workbenchObjectiveMax).toBeGreaterThan(0);
  });

  it("contient des dossiers chiffrés cohérents, un budget exact et des choix non isolés", () => {
    const budget = workshops.find(workshop =>
      workshop.tasks.some(task => task.kind === "budget")
    );
    expect(
      budget?.tasks.some(
        task =>
          task.kind === "budget" &&
          task.total === 600000 &&
          task.fields.length === 6
      )
    ).toBe(true);
    expect(workshops.every(workshop => workshop.documents.length > 0)).toBe(
      true
    );
    expect(
      workshops.filter(workshop =>
        workshop.tasks.some(task => task.kind === "dialogue")
      )
    ).toHaveLength(2);
    expect(
      workshops.filter(workshop =>
        workshop.tasks.some(task => task.kind === "writing")
      ).length
    ).toBeGreaterThanOrEqual(6);
  });

  it("calcule un atelier rempli sans correction manuelle pour les tâches objectives", () => {
    for (const workshop of workshops) {
      const result = evaluateWorkshop(workshop, answerFor(workshop.id));
      expect(result.objectiveScore).toBe(result.objectiveMax);
      expect(result.consequence).toMatch(
        /repères automatiques|Aucun point automatique/
      );
      if (
        workshop.tasks.some(
          task => task.kind === "writing" || task.kind === "dialogue"
        )
      )
        expect(result.manualPending).toBe(true);
    }
  });

  it("poursuit après une erreur et produit une conséquence dynamique", () => {
    const workshop = workshops.find(item =>
      item.tasks.some(task => task.id === "ab-calcul")
    );
    if (!workshop) throw new Error("atelier absent");
    const wrong: WorkAnswer = { ...answerFor(workshop.id) };
    const numericTask = workshop.tasks.find(task => task.kind === "numeric");
    if (!numericTask || numericTask.kind !== "numeric")
      throw new Error("tâche numérique absente");
    wrong[numericTask.fields[0].id] = "999";
    const result = evaluateWorkshop(workshop, wrong);
    expect(result.objectiveScore).toBeLessThan(result.objectiveMax);
    expect(result.consequence).toContain("poursuivez");
    expect(result.metrics).toHaveProperty("satisfaction");
  });

  it("branche réellement les ateliers 8 à 12 sans bloquer la suite", () => {
    const target = workshops.find(item =>
      item.tasks.some(task => task.id === "adaptation-calcul")
    );
    const crisis = workshops.find(item =>
      item.tasks.some(task => task.id === "crise-dialogue")
    );
    const final = workshops.find(item =>
      item.tasks.some(task => task.id === "note-finale")
    );
    if (!target || !crisis || !final)
      throw new Error("ateliers branchés absents");
    const strong = workshopForState(target, stateWith(10));
    const weak = workshopForState(target, stateWith(2));
    expect(
      strong.documents.find(
        document => document.title === "Tableau de situation initiale"
      )?.rows
    ).not.toEqual(
      weak.documents.find(
        document => document.title === "Tableau de situation initiale"
      )?.rows
    );
    expect(strong.brief).toContain("forte");
    expect(weak.brief).toContain("fragile");
    expect(
      workshopForState(crisis, stateWith(2)).documents.find(
        document => document.title === "Dossier de crise"
      )?.rows
    ).not.toEqual(crisis.documents[0].rows);
    expect(
      workshopForState(final, stateWith(10)).documents.find(
        document => document.title === "Bilan de mission"
      )?.rows
    ).not.toEqual(
      workshopForState(final, stateWith(2)).documents.find(
        document => document.title === "Bilan de mission"
      )?.rows
    );
    const strongAnswer = {
      ...answerFor(target.id),
      "adaptation-calcul-taux-demande": "7",
      "adaptation-calcul-cout-demande": "1428.57",
      "adaptation-calcul-delai-marge": "30",
      "adaptation-calcul-taux-reponse": "62.5",
    };
    const weakAnswer = {
      ...answerFor(target.id),
      "adaptation-calcul-taux-demande": "4.5",
      "adaptation-calcul-cout-demande": "2222.22",
      "adaptation-calcul-delai-marge": "6",
      "adaptation-calcul-taux-reponse": "40",
    };
    expect(evaluateWorkshop(strong, strongAnswer).objectiveScore).toBe(
      evaluateWorkshop(strong, strongAnswer).objectiveMax
    );
    expect(evaluateWorkshop(weak, weakAnswer).objectiveScore).toBe(
      evaluateWorkshop(weak, weakAnswer).objectiveMax
    );
  });

  it("n’expose pas les tables de corrigé dans shared et conserve des dialogues poursuivables", () => {
    const sharedSource = workshops
      .map(workshop => JSON.stringify(workshop))
      .join("\n");
    expect(sharedSource).not.toContain("expectedLabels");
    expect(sharedSource).not.toContain("sampleAnswers");
    for (const task of allTasks.filter(task => task.kind === "dialogue")) {
      for (const turn of task.turns) {
        expect(turn.fallback.length).toBeGreaterThan(20);
        expect(turn.fallback).not.toMatch(/fin de l'échange|clore|terminer/i);
      }
    }
  });

  it("conserve la validation de complétude des écrits sans attribuer leur qualité automatiquement", () => {
    const workshop = workshops.find(item =>
      item.tasks.some(task => task.kind === "dialogue")
    );
    if (!workshop) throw new Error("atelier absent");
    const answer = answerFor(workshop.id);
    expect(completeness(workshop, answer)).toEqual([]);
    const result = evaluateWorkshop(workshop, answer);
    expect(result.manualPending).toBe(true);
    expect(result.objectiveMax).toBeGreaterThan(0);
  });
});
