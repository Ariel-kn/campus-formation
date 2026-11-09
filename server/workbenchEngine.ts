import {
  INITIAL_WORK_METRICS,
  type DialogueTask,
  type NumericTask,
  type WorkAnswer,
  type WorkMetrics,
  type WorkState,
  type Workshop,
  type WorkTask,
} from "@shared/simulationWorkbench";
import { workshops } from "@shared/simulationWorkshops";

export type WorkshopEvaluation = {
  objectiveScore: number;
  objectiveMax: number;
  manualPending: boolean;
  consequence: string;
  metrics: Partial<WorkMetrics>;
};

type ExpectedNumeric = Record<string, number>;

const expectedLabels: Record<string, string[]> = {
  "diag-axes": [
    "Comparer les visites qualifiées",
    "Ne pas confondre portée et demande",
    "Documenter la source manquante",
    "Répartir le test sur 14 jours",
    "Taux de demandes par visite",
    "Taux de visites par impression",
    "Capacité quotidienne de conversations",
    "Traçage du canal d’origine",
    "Analyse des questions formulées",
    "Besoin d’une méthode commune",
    "Réduction des champs nécessaires",
    "Délai moyen de première réponse",
  ],
  "audience-cloze": [
    "besoin",
    "contexte",
    "promesse",
    "priorite",
    "hypothese",
    "critere",
    "ressource",
    "prochaine",
  ],
  "parcours-ordre": [
    "Observer les abandons",
    "Nommer l’intention principale",
    "Réduire les champs nécessaires",
    "Proposer une ressource adaptée",
    "Donner deux chemins de suite",
    "Mesurer la réponse par cohorte",
    "Prévoir une sortie simple",
  ],
  "editorial-funnel": [
    "Faire remarquer un problème",
    "Rendre la méthode concrète",
    "Donner un élément vérifiable",
    "Réduire une hésitation",
  ],
  "adaptation-decision": [
    "Lire le taux et la capacité",
    "Corriger le point faible prioritaire",
    "Libérer une nouvelle vague",
    "Vérifier le seuil après la vague",
  ],
  "operations-ordre": [
    "Vérifier le consentement",
    "Classer par besoin et délai",
    "Envoyer une réponse contextualisée",
    "Proposer une ressource utile",
    "Laisser choisir le rythme",
    "Mesurer la réponse par segment",
  ],
  "operations-cloze": [
    "consentement",
    "contexte",
    "délai",
    "ressource",
    "choix",
    "mesure",
    "sortie",
    "capacité",
  ],
};

const expectedNumbers: Record<string, ExpectedNumeric> = {
  "diag-calcul": {
    "diag-calcul-visites-total": 1686,
    "diag-calcul-demandes-total": 78,
    "diag-calcul-taux-demande": 4.63,
    "diag-calcul-jours-capacite": 350,
  },
  "budget-postes": {
    "budget-postes-production": 150000,
    "budget-postes-diffusion": 240000,
    "budget-postes-mesure": 50000,
    "budget-postes-relation": 70000,
    "budget-postes-accessibilite": 40000,
    "budget-postes-reserve": 50000,
  },
  "budget-calcul": {
    "budget-calcul-sous-total": 510000,
    "budget-calcul-vague": 120000,
    "budget-calcul-seuil-demande": 3,
    "budget-calcul-seuil-delai": 24,
  },
  "ab-calcul": {
    "ab-calcul-ctr-a": 6.2,
    "ab-calcul-ctr-b": 7,
    "ab-calcul-taux-demande-a": 5,
    "ab-calcul-net-b": 19,
  },
  "diagnostic-final-calcul": {
    "diagnostic-final-calcul-taux-visite": 3.15,
    "diagnostic-final-calcul-taux-demande": 4.49,
    "diagnostic-final-calcul-taux-rdv": 32.29,
    "diagnostic-final-calcul-taux-presence": 61.29,
    "diagnostic-final-calcul-taux-inscription": 12.5,
    "diagnostic-final-calcul-cout-demande": 4375,
    "diagnostic-final-calcul-cout-inscription": 35000,
    "diagnostic-final-calcul-marge-capacite": 8,
  },
};

const workshopById = (id: string) =>
  workshops.find(workshop => workshop.id === id);
const taskById = (workshop: Workshop, id: string): WorkTask | undefined =>
  workshop.tasks.find(task => task.id === id);
const numberValue = (value: string | undefined) =>
  Number(
    String(value ?? "")
      .trim()
      .replace(/[ \t\r\n]/g, "")
      .replace(",", ".")
  );
const sameNumber = (actual: number, expected: number) =>
  Number.isFinite(actual) && Math.abs(actual - expected) <= 0.011;

function tokenIdForLabel(
  task: Extract<WorkTask, { slots: unknown }>,
  label: string
): string {
  return task.tokens.find(token => token.label === label)?.id ?? "";
}

function expectedAnswerForTask(
  workshop: Workshop,
  task: WorkTask
): Record<string, string> {
  const answer: Record<string, string> = {};
  if ("slots" in task) {
    const labels = expectedLabels[task.id] ?? [];
    task.slots.forEach((slot, index) => {
      answer[slot.id] = tokenIdForLabel(task, labels[index] ?? "");
    });
  } else if (
    "fields" in task &&
    (task.kind === "numeric" || task.kind === "budget")
  ) {
    const numbers =
      task.id === "adaptation-calcul" || task.id === "diagnostic-final-calcul"
        ? numericExpected(workshop, task)
        : (expectedNumbers[task.id] ?? {});
    task.fields.forEach(field => {
      answer[field.id] = String(numbers[field.id] ?? "");
    });
  } else if ("fields" in task && task.kind === "writing") {
    task.fields.forEach(field => {
      answer[field.id] = fillWords(field.minWords ?? 1);
    });
  } else if (task.kind === "dialogue") {
    task.turns.forEach(turn => {
      answer[turn.id] = fillWords(
        turn.minWords,
        "Je reformule le besoin, je reconnais la contrainte et je propose une étape vérifiable pour poursuivre l’échange."
      );
      answer[`_sent:${turn.id}`] = "1";
    });
  }
  return answer;
}

function fillWords(
  minimum: number,
  sentence = "Analyse contextualisée et action mesurable."
): string {
  const words = sentence.split(/[ \t\r\n]+/);
  while (words.length < minimum) words.push("élément");
  return words.join(" ");
}

function numericExpected(
  workshop: Workshop,
  task: NumericTask
): ExpectedNumeric {
  if (task.id === "adaptation-calcul") {
    const situation =
      workshop.documents.find(
        document => document.title === "Tableau de situation initiale"
      )?.rows ?? [];
    const value = (label: string) =>
      Number(situation.find(row => row[0] === label)?.[1] ?? 0);
    const visits = value("Visites");
    const demands = value("Demandes");
    const budget = value("Budget engagé");
    const delay = value("Délai moyen");
    const replies = value("Réponses au suivi");
    return {
      "adaptation-calcul-taux-demande": Number(
        ((demands / visits) * 100).toFixed(2)
      ),
      "adaptation-calcul-cout-demande": Number((budget / demands).toFixed(2)),
      "adaptation-calcul-delai-marge": 48 - delay,
      "adaptation-calcul-taux-reponse": Number(
        ((replies / demands) * 100).toFixed(2)
      ),
    };
  }
  if (task.id === "diagnostic-final-calcul") {
    const rows =
      workshop.documents.find(
        document => document.title === "Tableau de pilotage à mi-parcours"
      )?.rows ?? [];
    const value = (label: string) =>
      Number(rows.find(row => row[0] === label)?.[1] ?? 0);
    const impressions = value("Impressions");
    const visits = value("Visites");
    const demands = value("Demandes");
    const appointments = value("Rendez-vous");
    const presences = value("Présences");
    const registrations = value("Inscriptions");
    const budget = value("Budget engagé");
    return {
      "diagnostic-final-calcul-taux-visite": Number(
        ((visits / impressions) * 100).toFixed(2)
      ),
      "diagnostic-final-calcul-taux-demande": Number(
        ((demands / visits) * 100).toFixed(2)
      ),
      "diagnostic-final-calcul-taux-rdv": Number(
        ((appointments / demands) * 100).toFixed(2)
      ),
      "diagnostic-final-calcul-taux-presence": Number(
        ((presences / appointments) * 100).toFixed(2)
      ),
      "diagnostic-final-calcul-taux-inscription": Number(
        ((registrations / demands) * 100).toFixed(2)
      ),
      "diagnostic-final-calcul-cout-demande": Number(
        (budget / demands).toFixed(2)
      ),
      "diagnostic-final-calcul-cout-inscription": Number(
        (budget / registrations).toFixed(2)
      ),
      "diagnostic-final-calcul-marge-capacite": 20 - registrations,
    };
  }
  return expectedNumbers[task.id] ?? {};
}

function objectiveForTask(
  workshop: Workshop,
  task: WorkTask,
  answer: WorkAnswer
): { score: number; max: number } {
  if (task.kind === "writing" || task.kind === "dialogue")
    return { score: 0, max: 0 };
  if ("slots" in task) {
    const labels = expectedLabels[task.id] ?? [];
    let score = 0;
    task.slots.forEach((slot, index) => {
      const expectedId = tokenIdForLabel(task, labels[index] ?? "");
      if (answer[slot.id] === expectedId) score += 1;
    });
    return { score, max: task.slots.length };
  }
  const numericTask = "fields" in task ? task : (task as NumericTask);
  if (numericTask.kind === "budget" && numericTask.total !== undefined) {
    const amounts = numericTask.fields.map(field =>
      numberValue(answer[field.id])
    );
    const valid = amounts.every(
      amount => Number.isFinite(amount) && amount >= 0
    );
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    return {
      score: valid && Math.abs(total - numericTask.total) <= 0.01 ? 1 : 0,
      max: 1,
    };
  }
  const expected = numericExpected(workshop, numericTask);
  if (numericTask.id === "budget-calcul") {
    expected["budget-calcul-sous-total"] = [
      "production",
      "diffusion",
      "mesure",
      "relation",
    ].reduce(
      (sum, key) => sum + numberValue(answer[`budget-postes-${key}`]),
      0
    );
    expected["budget-calcul-vague"] =
      numberValue(answer["budget-postes-diffusion"]) / 2;
  }
  let score = 0;
  numericTask.fields.forEach(field => {
    if (sameNumber(numberValue(answer[field.id]), expected[field.id]))
      score += 1;
  });
  return { score, max: numericTask.fields.length };
}

function updateMetrics(
  workshop: Workshop,
  ratio: number
): Partial<WorkMetrics> {
  const step = workshop.sequence;
  const quality = Math.round((ratio - 0.5) * 10);
  return {
    visibility: Math.round(step / 2) + quality,
    engagement: Math.round(step / 3) + quality,
    prospects: Math.round(step / 2) + quality,
    satisfaction: Math.round(step / 3) + quality,
  };
}

export function evaluateWorkshop(
  workshop: Workshop,
  answer: WorkAnswer
): WorkshopEvaluation {
  let objectiveScore = 0;
  let objectiveMax = 0;
  let manualPending = false;
  workshop.tasks.forEach(task => {
    const result = objectiveForTask(workshop, task, answer);
    objectiveScore += result.score;
    objectiveMax += result.max;
    if (task.kind === "writing" || task.kind === "dialogue")
      manualPending = true;
  });
  const ratio = objectiveMax ? objectiveScore / objectiveMax : 0.5;
  const metrics = updateMetrics(workshop, ratio);
  const status =
    objectiveMax === 0
      ? "Aucun point automatique n’est attribué ici : poursuivez, puis attendez la correction manuelle du raisonnement."
      : ratio >= 0.75
        ? "Les repères sont suffisamment solides : poursuivez avec une vérification ciblée."
        : ratio >= 0.45
          ? "Les repères sont partiels : poursuivez, puis corrigez le point le plus incertain avant d’amplifier."
          : "Plusieurs repères restent fragiles : poursuivez sans bloquer, reprenez les données et testez une réparation réversible.";
  const manual = manualPending
    ? " Les champs rédigés restent en attente d’une correction manuelle fondée sur le raisonnement, jamais sur la longueur."
    : "";
  const automatic =
    objectiveMax > 0
      ? `${objectiveScore}/${objectiveMax} repères automatiques. `
      : "";
  const allocationIncident =
    workshop.sequence === 2
      ? numberValue(answer["budget-postes-relation"]) < 40000
        ? " Incident : le suivi manque de ressources ; le dossier suivant comportera un délai de réponse dégradé."
        : numberValue(answer["budget-postes-reserve"]) < 10000
          ? " Incident : la réserve est insuffisante pour corriger un problème ; vous devrez réparer avant d’amplifier."
          : " Votre provision de suivi et de correction sera prise en compte dans la suite de la mission."
      : "";
  return {
    objectiveScore,
    objectiveMax,
    manualPending,
    consequence: `Atelier ${workshop.sequence} : ${automatic}${status}${manual}${allocationIncident}`,
    metrics,
  };
}

function branchQuality(
  state: WorkState,
  beforeSequence: number
): "forte" | "fragile" {
  const budget =
    beforeSequence > 2
      ? Object.values(state.records).find(record =>
          Object.keys(record.answer).some(key =>
            key.startsWith("budget-postes-")
          )
        )
      : null;
  if (
    budget?.committed &&
    (numberValue(budget.answer["budget-postes-relation"]) < 40000 ||
      numberValue(budget.answer["budget-postes-reserve"]) < 10000 ||
      numberValue(budget.answer["budget-postes-mesure"]) < 20000)
  )
    return "fragile";
  const previous = Object.entries(state.records)
    .filter(
      ([id]) =>
        (workshops.find(w => w.id === id)?.sequence ?? 0) < beforeSequence
    )
    .map(([, record]) => record)
    .filter(
      record =>
        record.committed &&
        record.objectiveMax > 0 &&
        Number.isFinite(record.objectiveScore)
    );
  if (!previous.length) return "fragile";
  const average =
    previous.reduce(
      (sum, record) => sum + record.objectiveScore / record.objectiveMax,
      0
    ) / previous.length;
  return average >= 0.7 ? "forte" : "fragile";
}

export function workshopForState(
  workshop: Workshop,
  state: WorkState
): Workshop {
  if (workshop.sequence < 4) return workshop;
  const branch = branchQuality(state, workshop.sequence);
  const clone: Workshop = JSON.parse(JSON.stringify(workshop)) as Workshop;
  const hasTask = (id: string) => clone.tasks.some(task => task.id === id);
  if (hasTask("adaptation-calcul")) {
    const situation = clone.documents.find(
      document => document.title === "Tableau de situation initiale"
    );
    if (situation)
      situation.rows =
        branch === "forte"
          ? [
              ["Visites", "1600", "visites suivies"],
              ["Demandes", "112", "formulaires complets"],
              ["Budget engagé", "160000", "FCFA"],
              ["Délai moyen", "18", "heures"],
              ["Réponses au suivi", "70", "contacts"],
              ["Satisfaction", "78", "sur 100"],
            ]
          : [
              ["Visites", "1000", "visites suivies"],
              ["Demandes", "45", "formulaires complets"],
              ["Budget engagé", "100000", "FCFA"],
              ["Délai moyen", "42", "heures"],
              ["Réponses au suivi", "18", "contacts"],
              ["Satisfaction", "54", "sur 100"],
            ];
  } else if (hasTask("crise-dialogue")) {
    const crisis = clone.documents.find(
      document => document.title === "Dossier de crise"
    );
    const row = crisis?.rows?.[1];
    if (row)
      row[1] =
        branch === "forte"
          ? "visible depuis 22 minutes, partagé 6 fois"
          : "visible depuis 52 minutes, partagé 31 fois";
  }
  if (hasTask("operations-ordre")) {
    const operations = clone.documents.find(
      document => document.title === "Tableau de suivi"
    );
    if (operations)
      operations.rows =
        branch === "forte"
          ? [
              ["Urgente", "12", "24 h", "équipe à réunir"],
              ["Exploratoire", "28", "72 h", "besoin de comprendre"],
              ["À revoir", "10", "7 jours", "a demandé une ressource"],
              [
                "Sans réponse",
                "15",
                "choix de rythme",
                "consentement maintenu",
              ],
            ]
          : [
              ["Urgente", "25", "24 h", "équipe à réunir"],
              ["Exploratoire", "54", "72 h", "besoin de comprendre"],
              ["À revoir", "21", "7 jours", "a demandé une ressource"],
              [
                "Sans réponse",
                "34",
                "choix de rythme",
                "consentement maintenu",
              ],
            ];
  }
  if (hasTask("diagnostic-final-calcul")) {
    const finalTable = clone.documents.find(
      document => document.title === "Tableau de pilotage à mi-parcours"
    );
    if (finalTable)
      finalTable.rows =
        branch === "forte"
          ? [
              ["Impressions", "82000"],
              ["Visites", "2920"],
              ["Demandes", "148"],
              ["Rendez-vous", "54"],
              ["Présences", "38"],
              ["Inscriptions", "18"],
              ["Budget engagé", "480000"],
              ["Réponses de suivi", "81"],
            ]
          : [
              ["Impressions", "52000"],
              ["Visites", "1480"],
              ["Demandes", "51"],
              ["Rendez-vous", "18"],
              ["Présences", "9"],
              ["Inscriptions", "4"],
              ["Budget engagé", "300000"],
              ["Réponses de suivi", "17"],
            ];
  }
  if (hasTask("note-finale")) {
    const qualityRow = clone.documents
      .find(document => document.title === "Bilan de mission")
      ?.rows?.find(row => row[0] === "La qualité des demandes progresse");
    if (qualityRow) qualityRow[1] = branch === "forte" ? "moyen" : "faible";
  }
  const allocation = Object.values(state.records).find(record =>
    Object.keys(record.answer).some(key => key.startsWith("budget-postes-"))
  );
  if (allocation?.committed) {
    if (hasTask("adaptation-calcul")) {
      const budgetRow = clone.documents
        .find(document => document.title === "Tableau de situation initiale")
        ?.rows?.find(row => row[0] === "Budget engagé");
      if (budgetRow)
        budgetRow[1] = String(
          Math.round(
            numberValue(allocation.answer["budget-postes-diffusion"]) / 2
          )
        );
      clone.documents.push({
        title: "Conséquence de votre arbitrage",
        text: `La première vague engage la moitié de votre budget de diffusion. Votre plan réserve ${allocation.answer["budget-postes-relation"]} FCFA au suivi et ${allocation.answer["budget-postes-reserve"]} FCFA aux corrections. Un suivi sous 40 000 FCFA, une mesure sous 20 000 FCFA ou une réserve sous 10 000 FCFA fragilisent la capacité de réponse. Ces seuils sont des règles du cas fictif, pas des normes de marché.`,
      });
    }
    if (hasTask("note-finale"))
      clone.documents.push({
        title: "Votre arbitrage de départ",
        columns: ["Poste", "Montant FCFA"],
        rows: [
          "production",
          "diffusion",
          "mesure",
          "relation",
          "accessibilite",
          "reserve",
        ].map(key => [key, allocation.answer[`budget-postes-${key}`] || "0"]),
      });
  }
  clone.brief = `${workshop.brief} Branche ${branch} : ${branch === "forte" ? "la qualité permet une amplification par vagues, sous contrôle du délai." : "le parcours doit être réparé avant toute amplification."}`;
  return clone;
}

export const workbenchObjectiveMax = workshops.reduce(
  (total, workshop) =>
    total +
    workshop.tasks.reduce((subtotal, task) => {
      if (task.kind === "writing" || task.kind === "dialogue") return subtotal;
      return (
        subtotal +
        (task.kind === "budget"
          ? 1
          : "slots" in task
            ? task.slots.length
            : task.fields.length)
      );
    }, 0),
  0
);

export const sampleAnswers: Record<string, WorkAnswer> = Object.fromEntries(
  workshops.map(workshop => [
    workshop.id,
    Object.assign(
      {},
      ...workshop.tasks.map(task => expectedAnswerForTask(workshop, task))
    ),
  ])
);

export function sampleAnswerForWorkshop(workshop: Workshop): WorkAnswer {
  return Object.assign(
    {},
    ...workshop.tasks.map(task => expectedAnswerForTask(workshop, task))
  );
}
export { expectedLabels };
