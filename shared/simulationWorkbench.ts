export const WORKBENCH_CODE = "SIM-BD-NAYA-04";
export const PRACTICE_SECONDS = 7200; // 2 heures (120 minutes)
export type WorkAnswer = Record<string, string>;
export type WorkDocument = {
  title: string;
  text?: string;
  columns?: string[];
  rows?: string[][];
};
export type TextField = {
  id: string;
  label: string;
  minWords?: number;
  placeholder?: string;
};
export type PlacementTask = {
  id: string;
  kind: "placement" | "cloze" | "ordering";
  title: string;
  instructions: string;
  tokens: { id: string; label: string }[];
  slots: { id: string; label: string }[];
  passage?: string;
};
export type NumericTask = {
  id: string;
  kind: "numeric" | "budget";
  title: string;
  instructions: string;
  fields: { id: string; label: string; unit: string }[];
  total?: number;
};
export type WritingTask = {
  id: string;
  kind: "writing";
  title: string;
  instructions: string;
  fields: TextField[];
};
export type VoiceTask = {
  id: string;
  kind: "voice";
  title: string;
  instructions: string;
  prompt: string;
  maxSeconds?: number;
};
export type DialogueTask = {
  id: string;
  kind: "dialogue";
  title: string;
  instructions: string;
  character: string;
  role: string;
  turns: {
    id: string;
    message: string;
    minWords: number;
    cues: string[];
    aligned: string;
    fallback: string;
  }[];
};
export type WorkTask = PlacementTask | NumericTask | WritingTask | DialogueTask | VoiceTask;
export type Workshop = {
  id: string;
  sequence: number;
  title: string;
  minutes: number;
  brief: string;
  documents: WorkDocument[];
  tasks: WorkTask[];
  rubric: string[];
};
export type WorkResponse = {
  answer: WorkAnswer;
  committed: boolean;
  objectiveScore: number;
  objectiveMax: number;
  manualPending: boolean;
  consequence: string;
  at: string;
};
export type WorkReview = {
  score: number;
  feedback: string;
  actorId: number;
  at: string;
};
export type WorkState = {
  version: 3;
  records: Record<string, WorkResponse>;
  review?: WorkReview;
};
export type WorkMetrics = {
  budget: number;
  visibility: number;
  engagement: number;
  prospects: number;
  satisfaction: number;
};
export const INITIAL_WORK_METRICS: WorkMetrics = {
  budget: 600000,
  visibility: 35,
  engagement: 3,
  prospects: 90,
  satisfaction: 65,
};
export function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
export function answerKeys(task: WorkTask): string[] {
  if (task.kind === "voice") return [task.id];
  if (
    task.kind === "placement" ||
    task.kind === "cloze" ||
    task.kind === "ordering"
  )
    return task.slots.map(s => s.id);
  if (task.kind === "dialogue") return task.turns.map(t => t.id);
  return "fields" in task ? task.fields.map(f => f.id) : [];
}
export function completeness(workshop: Workshop, answer: WorkAnswer): string[] {
  const errors: string[] = [];
  for (const task of workshop.tasks) {
    if (task.kind === "voice") {
      if (!String(answer[task.id] || "").trim())
        errors.push(`${task.title} : enregistrez votre message ou pitch vocal avant de continuer.`);
    } else if (task.kind === "dialogue") {
      for (const turn of task.turns)
        if (
          wordCount(answer[turn.id] || "") < turn.minWords ||
          answer[`_sent:${turn.id}`] !== "1"
        )
          errors.push(`Réponse au personnage : ${turn.minWords} mots minimum.`);
    } else if (task.kind === "writing") {
      for (const field of task.fields)
        if (wordCount(answer[field.id] || "") < (field.minWords || 1))
          errors.push(`${field.label} : ${field.minWords || 1} mots minimum.`);
    } else if (task.kind === "numeric" || task.kind === "budget") {
      for (const field of task.fields)
        if (
          !String(answer[field.id] ?? "").trim() ||
          !Number.isFinite(Number(String(answer[field.id]).replace(",", ".")))
        )
          errors.push(`${field.label} : valeur numérique requise.`);
      if (task.kind === "budget" && task.total !== undefined) {
        const sum = task.fields.reduce(
          (s, f) => s + Number(String(answer[f.id] || "0").replace(",", ".")),
          0
        );
        if (
          Math.abs(sum - task.total) > 0.01 ||
          task.fields.some(
            f =>
              Number(String(answer[f.id] || "0").replace(",", ".")) < 0 ||
              !Number.isInteger(
                Number(String(answer[f.id] || "0").replace(",", "."))
              )
          )
        )
          errors.push(
            `Répartissez exactement ${task.total.toLocaleString("fr-FR")} FCFA sans valeur négative.`
          );
      }
    } else if ("slots" in task) {
      const values = task.slots.map(slot => answer[slot.id]);
      if (values.some(value => !task.tokens.some(token => token.id === value)))
        errors.push(`${task.title} : complétez toutes les cases.`);
      if (
        new Set(values.filter(Boolean)).size !== values.filter(Boolean).length
      )
        errors.push(
          `${task.title} : chaque carte ne peut être utilisée qu’une fois.`
        );
    }
  }
  return errors;
}
// Réactions scénarisées, sans appel à une IA ni évaluation sémantique prétendue.
export function characterReaction(
  turn: DialogueTask["turns"][number],
  text: string
) {
  const normalized = text
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return turn.cues.some(cue =>
    normalized.includes(cue.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  )
    ? turn.aligned
    : turn.fallback;
}
