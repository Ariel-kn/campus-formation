import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SimulationActivityEditor from "../client/src/components/SimulationActivityEditor";
import type { Workshop } from "../shared/simulationWorkbench";

const tokens = Array.from({ length: 18 }, (_, index) => ({
  id: `card-${index + 1}`,
  label: `Carte de travail ${index + 1}`,
}));

const workshop: Workshop = {
  id: "atelier-rendu",
  sequence: 2,
  title: "Atelier de campagne responsable",
  minutes: 45,
  brief:
    "Construisez une recommandation exploitable à partir de documents de travail.",
  documents: [
    {
      title: "Indicateurs de campagne",
      columns: ["Canal", "Demandes"],
      rows: [
        ["Réseau A", "24"],
        ["Réseau B", "16"],
      ],
    },
    {
      title: "Note de contexte",
      text: "Le public attend une réponse claire et vérifiable.",
    },
  ],
  rubric: ["Pertinence", "Clarté"],
  tasks: [
    {
      id: "placement-task",
      kind: "placement",
      title: "Associer les leviers",
      instructions: "Placez chaque carte dans la case correspondante.",
      tokens,
      slots: [
        { id: "placement-slot-1", label: "Levier 1" },
        { id: "placement-slot-2", label: "Levier 2" },
      ],
    },
    {
      id: "cloze-task",
      kind: "cloze",
      title: "Compléter la formulation",
      instructions: "Complétez le texte sans consulter de solution.",
      passage:
        "Une stratégie utile commence par {cloze-slot-1} puis mesure {cloze-slot-2}.",
      tokens,
      slots: [
        { id: "cloze-slot-1", label: "Premier élément" },
        { id: "cloze-slot-2", label: "Mesure" },
      ],
    },
    {
      id: "ordering-task",
      kind: "ordering",
      title: "Ordonner le plan",
      instructions: "Construisez une séquence d’action.",
      tokens,
      slots: [
        { id: "ordering-slot-1", label: "Étape 1" },
        { id: "ordering-slot-2", label: "Étape 2" },
        { id: "ordering-slot-3", label: "Étape 3" },
      ],
    },
    {
      id: "numeric-task",
      kind: "numeric",
      title: "Lire les résultats",
      instructions: "Saisissez les valeurs observées.",
      fields: [
        { id: "reach", label: "Portée", unit: "personnes" },
        { id: "rate", label: "Taux", unit: "%" },
      ],
    },
    {
      id: "budget-task",
      kind: "budget",
      title: "Répartir le budget",
      instructions: "Répartissez le budget entre les postes.",
      total: 600000,
      fields: [
        { id: "production", label: "Production", unit: "FCFA" },
        { id: "media", label: "Média", unit: "FCFA" },
      ],
    },
    {
      id: "writing-task",
      kind: "writing",
      title: "Rédiger la recommandation",
      instructions: "Expliquez votre choix avec des arguments concrets.",
      fields: [
        {
          id: "recommendation",
          label: "Recommandation",
          minWords: 20,
          placeholder: "Votre recommandation",
        },
      ],
    },
    {
      id: "dialogue-task",
      kind: "dialogue",
      title: "Échanger avec la cliente",
      instructions:
        "Répondez à chaque tour, puis envoyez-le pour faire progresser le scénario.",
      character: "Naya",
      role: "Cliente",
      turns: [
        {
          id: "turn-1",
          message: "Quel signal voulez-vous vérifier en premier ?",
          minWords: 4,
          cues: ["source", "signal"],
          aligned: "Votre démarche commence par une vérification utile.",
          fallback: "Précisez le signal et la manière de le vérifier.",
        },
        {
          id: "turn-2",
          message: "Comment présenterez-vous la prochaine étape ?",
          minWords: 4,
          cues: ["étape", "mesure"],
          aligned: "La prochaine étape est formulée de manière concrète.",
          fallback: "Reliez votre prochaine étape à un indicateur observable.",
        },
      ],
    },
  ],
};

describe("SimulationActivityEditor", () => {
  it("rend un atelier complet avec tous les types d’activités", () => {
    const markup = renderToStaticMarkup(
      createElement(SimulationActivityEditor, {
        workshop,
        answer: {
          "placement-slot-1": "card-1",
          reach: "1200",
          production: "300000",
          recommendation: "Une recommandation initiale",
          "turn-1": "Je vérifie le signal et sa source.",
          "_sent:turn-1": "1",
        },
        onChange: vi.fn(),
      })
    );

    expect(markup).toContain("Atelier de campagne responsable");
    expect(markup).toContain("Documents et données");
    expect(markup).toContain("Indicateurs de campagne");
    expect(markup).toContain("Banque de cartes");
    expect(markup).toContain("18 cartes");
    expect(markup).toContain("Une stratégie utile commence par");
    expect(markup).toContain("Étape 1");
    expect(markup).toContain("Total engagé en direct");
    expect(markup).toContain("600 000");
    expect(markup).toContain("Portée");
    expect(markup).toContain("Recommandation");
    expect(markup).toContain("Quel signal voulez-vous vérifier en premier ?");
    expect(markup).toContain(
      "Votre démarche commence par une vérification utile."
    );
    expect(markup).toContain("Comment présenterez-vous la prochaine étape ?");
    expect(markup).toContain("Envoyer le tour");
  });

  it("rejoue une réponse de dialogue en lecture seule avec tous les tours visibles", () => {
    const markup = renderToStaticMarkup(
      createElement(SimulationActivityEditor, {
        workshop,
        disabled: true,
        answer: {
          "turn-1": "Je vérifie le signal et sa source.",
          "_sent:turn-1": "1",
          "turn-2": "Je mesure l’étape suivante.",
          "_sent:turn-2": "1",
        },
        onChange: vi.fn(),
      })
    );

    expect(markup).toContain("Lecture seule");
    expect(markup).toContain("Je vérifie le signal et sa source.");
    expect(markup).toContain("Je mesure l’étape suivante.");
    expect(markup).toContain(
      "La prochaine étape est formulée de manière concrète."
    );
    expect(markup).toContain('disabled=""');
  });
});
