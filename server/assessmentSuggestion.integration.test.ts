import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSubmissionForReview: vi.fn(),
  listLLMModels: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getSubmissionForReview: mocks.getSubmissionForReview };
});
vi.mock("./_core/llm", () => ({ listLLMModels: mocks.listLLMModels, invokeLLM: mocks.invokeLLM }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (): TrpcContext => ({ user: { id: 7, openId: "admin-test", name: "Formateur", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("suggestion IA d’évaluation", () => {
  it("retourne une suggestion prudente lorsque la réponse du modèle est incomplète", async () => {
    mocks.getSubmissionForReview.mockResolvedValue({ assessment: { title: "Évaluation", instructions: "Analysez le cas." }, questions: [], submission: { answers: {}, autoScore: 12 } });
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-nano" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: '{"score":12' } }] });
    const caller = appRouter.createCaller(context());
    await expect(caller.admin.suggestCorrection({ submissionId: 4 })).resolves.toMatchObject({ score: 12, confidence: 20, feedback: expect.stringContaining("assistant") });
  });

  it("retourne une suggestion prudente lorsqu’un appel IA échoue", async () => {
    mocks.getSubmissionForReview.mockResolvedValue({ assessment: { title: "Évaluation", instructions: "Analysez le cas." }, questions: [], submission: { answers: {}, autoScore: null } });
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-nano" }] });
    mocks.invokeLLM.mockRejectedValue(new Error("Service indisponible"));
    const caller = appRouter.createCaller(context());
    await expect(caller.admin.suggestCorrection({ submissionId: 4 })).resolves.toMatchObject({ score: 10, confidence: 20 });
  });

  it("normalise une suggestion détaillée et une confiance exprimée entre zéro et un", async () => {
    mocks.getSubmissionForReview.mockResolvedValue({ assessment: { title: "Évaluation", instructions: "Analysez le cas." }, questions: [], submission: { answers: {}, autoScore: 12 } });
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ score: 14.2, feedback: "Analyse précise des objectifs et des indicateurs proposés.", strengths: ["Objectifs identifiés"], improvements: ["Préciser le calendrier"], confidence: 0.72 }) } }] });
    const caller = appRouter.createCaller(context());
    await expect(caller.admin.suggestCorrection({ submissionId: 4 })).resolves.toMatchObject({ score: 14.2, confidence: 72, feedback: expect.stringContaining("Analyse précise") });
  });
});
