import { describe, expect, it } from "vitest";
import { workshops } from "../shared/simulationWorkshops";
import {
  completeness,
  answerKeys,
  type WorkState,
  type WorkAnswer,
} from "../shared/simulationWorkbench";
import {
  evaluateWorkshop,
  sampleAnswerForWorkshop,
  sampleAnswers,
  workshopForState,
  workbenchObjectiveMax,
} from "./workbenchEngine";
import { previewWorkbench } from "./workbenchPreview";

describe("épreuve multi-format — parcours complet", () => {
  it("résout six sections successives et adapte les données sans accéder à une copie élève", () => {
    const answers: Record<string, WorkAnswer> = {};
    const state: WorkState = { version: 3, records: {} };
    let total = 0;
    for (const original of workshops) {
      const w = workshopForState(original, state);
      const answer = sampleAnswerForWorkshop(w);
      expect(completeness(w, answer), w.id).toEqual([]);
      const r = evaluateWorkshop(w, answer);
      expect(r.objectiveScore, w.id).toBe(r.objectiveMax);
      total += r.objectiveScore;
      answers[w.id] = answer;
      state.records[w.id] = { ...r, answer, committed: true, at: "test" };
      const preview = previewWorkbench(answers);
      expect(preview.currentStep).toBe(w.sequence);
    }
    expect(total).toBe(workbenchObjectiveMax);
    expect(previewWorkbench(answers).currentStep).toBe(6);
  });
  it("le budget est libre et les contrôles dépendent de la répartition saisie", () => {
    const w = workshops.find(w => w.tasks.some(t => t.id === "budget-postes"))!;
    const a = {
      ...sampleAnswers[w.id],
      "budget-postes-production": "100000",
      "budget-postes-diffusion": "200000",
      "budget-postes-mesure": "100000",
      "budget-postes-relation": "100000",
      "budget-postes-accessibilite": "50000",
      "budget-postes-reserve": "50000",
      "budget-calcul-sous-total": "500000",
      "budget-calcul-vague": "100000",
    };
    expect(completeness(w, a)).toEqual([]);
    const r = evaluateWorkshop(w, a);
    expect(r.objectiveScore).toBe(r.objectiveMax);
    const negative = { ...a, "budget-postes-reserve": "-1" };
    expect(completeness(w, negative).length).toBeGreaterThan(0);
  });
  it("répercute un suivi sous-financé et la diffusion choisie dans les chiffres de l’atelier suivant", () => {
    const budget = workshops.find(w =>
      w.tasks.some(t => t.id === "budget-postes")
    )!;
    const answer = {
      ...sampleAnswers[budget.id],
      "budget-postes-relation": "10000",
      "budget-postes-diffusion": "300000",
    };
    const result = evaluateWorkshop(budget, answer);
    expect(result.consequence).toContain("délai de réponse dégradé");
    const state: WorkState = {
      version: 3,
      records: {
        [budget.id]: { ...result, answer, committed: true, at: "test" },
      },
    };
    const adapted = workshopForState(
      workshops.find(w => w.tasks.some(t => t.id === "adaptation-calcul"))!,
      state
    );
    expect(adapted.brief).toContain("fragile");
    expect(
      adapted.documents
        .find(d => d.title === "Tableau de situation initiale")
        ?.rows?.find(r => r[0] === "Budget engagé")?.[1]
    ).toBe("150000");
    expect(
      adapted.documents
        .find(d => d.title === "Tableau de situation initiale")
        ?.rows?.find(r => r[0] === "Délai moyen")?.[1]
    ).toBe("42");
    const good = sampleAnswerForWorkshop(adapted);
    expect(evaluateWorkshop(adapted, good).objectiveScore).toBe(
      evaluateWorkshop(adapted, good).objectiveMax
    );
  });
  it("chaque trou du texte correspond à une vraie case, avec des distracteurs mélangés", () => {
    for (const w of workshops)
      for (const t of w.tasks) {
        if (t.kind === "cloze")
          for (const slot of t.slots)
            expect(t.passage).toContain(`{${slot.id}}`);
        if ("slots" in t) {
          const used = t.slots.map(s => sampleAnswers[w.id][s.id]);
          expect(t.tokens.map(t => t.id).slice(0, used.length)).not.toEqual(
            used
          );
        }
      }
  });
  it("ne laisse pas valider une discussion non envoyée ou un faux remplissage de cartes", () => {
    const w = workshops.find(w => w.tasks.some(t => t.kind === "dialogue"))!;
    const a = { ...sampleAnswers[w.id] };
    const t = w.tasks.find(t => t.kind === "dialogue");
    if (!t || t.kind !== "dialogue") throw new Error("conversation absente");
    delete a[`_sent:${t.turns[0].id}`];
    expect(completeness(w, a).length).toBeGreaterThan(0);
    const first = workshops[0];
    const p = first.tasks.find(t => "slots" in t);
    if (!p || !("slots" in p)) throw new Error("placement absent");
    const wrong = { ...sampleAnswers[first.id] };
    p.slots.forEach(s => (wrong[s.id] = p.tokens[0].id));
    expect(completeness(first, wrong)).toContain(
      `${p.title} : chaque carte ne peut être utilisée qu’une fois.`
    );
  });
  it("la relecture d’un atelier ne change pas après les résultats des ateliers suivants", () => {
    const w = workshops[3];
    const state: WorkState = {
      version: 3,
      records: {
        [workshops[0].id]: {
          answer: {},
          committed: true,
          objectiveScore: 0,
          objectiveMax: 8,
          manualPending: false,
          consequence: "",
          at: "test",
        },
      },
    };
    const before = workshopForState(w, state);
    for (const later of workshops.slice(4))
      state.records[later.id] = {
        answer: {},
        committed: true,
        objectiveScore: 100,
        objectiveMax: 100,
        manualPending: true,
        consequence: "",
        at: "test",
      };
    expect(workshopForState(w, state)).toEqual(before);
  });
  it("un texte de longueur suffisante n’obtient aucune note de qualité automatique", () => {
    const w = workshops[5];
    const a = sampleAnswers[w.id];
    const r = evaluateWorkshop(w, a);
    expect(r.objectiveMax).toBeGreaterThan(0);
    expect(r.manualPending).toBe(true);
    expect(r.consequence).not.toContain("0/0");
  });
});
