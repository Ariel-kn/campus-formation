import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AssessmentPanel } from "../client/src/pages/Home";

describe("rendu de l’évaluation élève", () => {
  it("affiche réellement le Quiz et la rédaction sans bloc de cas pratique séparé", () => {
    const module = {
      id: 101,
      code: "M1",
      sequence: 1,
      title: "Module 1 — Community Management fondamental",
      resources: [],
      deliverables: [],
      questions: [
        { id: 1, type: "single", prompt: "Quel est le rôle du Community Manager ?", options: ["Animer une communauté", "Conduire un bus"], maxPoints: 2 },
        { id: 2, type: "essay", prompt: "Proposez trois piliers éditoriaux pour BijouxWax.", maxPoints: 10 },
      ],
      assessment: { title: "Évaluation de fin de module 1", instructions: "Situation — BijouxWax souhaite structurer sa présence digitale.", dueAt: null, isOpen: true },
      submission: null,
    } as any;
    const markup = renderToStaticMarkup(createElement(AssessmentPanel, { module, answers: {}, setAnswers: () => undefined, onSave: () => undefined, onSubmit: () => undefined, isSaving: false }));
    expect(markup).toContain("Partie 1 — Quiz");
    expect(markup).toContain("Quel est le rôle du Community Manager ?");
    expect(markup).toContain("Partie 2 — Rédaction");
    expect(markup).not.toContain("Une situation professionnelle à analyser");
    expect(markup).toContain("Proposez trois piliers éditoriaux pour BijouxWax.");
  });

  it("masque les questions tant que le formateur n’a pas ouvert l’évaluation", () => {
    const module = { id: 102, code: "M1", title: "Module 1", resources: [], deliverables: [], questions: [{ id: 1, type: "single", prompt: "Question test", options: ["Oui", "Non"], maxPoints: 2 }], assessment: { title: "Évaluation", instructions: "Consigne", isOpen: false }, submission: null } as any;
    const markup = renderToStaticMarkup(createElement(AssessmentPanel, { module, answers: {}, setAnswers: () => undefined, onSave: () => undefined, onSubmit: () => undefined, isSaving: false }));
    expect(markup).toContain("Évaluation verrouillée");
    expect(markup).not.toContain("Question test");
  });
});
