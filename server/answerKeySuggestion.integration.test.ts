import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAssessmentAnswerKeyDetail: vi.fn(),
  listLLMModels: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getAssessmentAnswerKeyDetail: mocks.getAssessmentAnswerKeyDetail };
});
vi.mock("./_core/llm", () => ({ listLLMModels: mocks.listLLMModels, invokeLLM: mocks.invokeLLM }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = (): TrpcContext => ({ user: { id: 7, openId: "admin-test", name: "Formateur", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
const detail = { assessment: { id: 4, title: "Évaluation stratégie", instructions: "Analysez un cas et justifiez vos recommandations." }, questions: [{ sequence: 1, type: "single", prompt: "Quel levier privilégier ?", options: ["SEO", "Affiche"], correctAnswers: ["SEO"], maxPoints: 2 }, { sequence: 2, type: "essay", prompt: "Proposez un plan d’action.", correctAnswers: null, maxPoints: 10 }], answerKey: null, recipients: [], candidates: [] };

describe("suggestion IA de corrigé type", () => {
  it("produit un corrigé détaillé exploitable et modifiable par le formateur", async () => {
    mocks.getAssessmentAnswerKeyDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "## Question 1\n\n**Réponse attendue :** SEO, car il répond à une intention de recherche.\n\n## Question 2\n\nLe plan doit définir l’objectif, la cible, les actions et les indicateurs." } }] });
    const caller = appRouter.createCaller(context());
    await expect(caller.admin.suggestAnswerKey({ assessmentId: 4 })).resolves.toMatchObject({ confidence: 75, content: expect.stringContaining("Réponse attendue") });
    expect(mocks.invokeLLM).toHaveBeenCalledOnce();
  });

  it("transmet les consignes de présentation du formateur au modèle", async () => {
    mocks.getAssessmentAnswerKeyDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "## Corrigé\n\nRéponse attendue et méthode de raisonnement expliquées de façon détaillée pour le formateur." } }] });
    const caller = appRouter.createCaller(context());
    await caller.admin.suggestAnswerKey({ assessmentId: 4, guidance: "Présentez une grille en trois critères et ajoutez un exemple bref." });
    expect(mocks.invokeLLM.mock.calls.at(-1)?.[0].messages[1].content).toContain("grille en trois critères");
  });

  it("conserve une proposition de base lorsque le modèle échoue", async () => {
    mocks.getAssessmentAnswerKeyDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    mocks.invokeLLM.mockRejectedValue(new Error("Service indisponible"));
    const caller = appRouter.createCaller(context());
    await expect(caller.admin.suggestAnswerKey({ assessmentId: 4 })).resolves.toMatchObject({ confidence: 20, content: expect.stringContaining("SEO") });
  });
});
