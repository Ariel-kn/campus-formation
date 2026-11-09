import { workshops } from "../shared/simulationWorkshops";
import {
  INITIAL_WORK_METRICS,
  completeness,
  type WorkAnswer,
  type WorkState,
} from "../shared/simulationWorkbench";
import { evaluateWorkshop, workshopForState } from "./workbenchEngine";
import { TRPCError } from "@trpc/server";

export function previewWorkbench(answers: Record<string, WorkAnswer>) {
  const state: WorkState = { version: 3, records: {} };
  const metrics = { ...INITIAL_WORK_METRICS };
  let currentStep = 0;
  for (const original of workshops) {
    const answer = answers[original.id];
    if (!answer) break;
    const workshop = workshopForState(original, state);
    const errors = completeness(workshop, answer);
    if (errors.length)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: errors.slice(0, 3).join(" "),
      });
    const result = evaluateWorkshop(workshop, answer);
    state.records[workshop.id] = {
      answer,
      committed: true,
      objectiveScore: result.objectiveScore,
      objectiveMax: result.objectiveMax,
      manualPending: result.manualPending,
      consequence: result.consequence,
      at: new Date().toISOString(),
    };
    for (const [k, d] of Object.entries(result.metrics)) {
      const key = k as keyof typeof metrics;
      metrics[key] = Math.max(0, metrics[key] + (d || 0));
      if (["visibility", "engagement", "satisfaction"].includes(key))
        metrics[key] = Math.min(100, metrics[key]);
    }
    currentStep++;
  }
  return {
    workshops: workshops.map(w => workshopForState(w, state)),
    currentStep,
    records: Object.fromEntries(
      Object.entries(state.records).map(([id, r]) => [
        id,
        { answer: r.answer, committed: true, consequence: r.consequence },
      ])
    ),
    metrics,
  };
}
