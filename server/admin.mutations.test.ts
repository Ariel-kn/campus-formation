import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateModuleContent: vi.fn(),
  copyRubric: vi.fn(),
  requestRevision: vi.fn(),
  requestDeliverableRevision: vi.fn(),
  reviewDeliverable: vi.fn(),
  reviewSubmission: vi.fn(),
  getReviewedSubmissions: vi.fn().mockResolvedValue([{ submission: { id: 18, status: "reviewed", manualScore: 14 }, student: { name: "Élève test" }, module: { title: "Module 1" } }]),
  getAssessmentAnswerKeyDetail: vi.fn().mockResolvedValue({ assessment: { id: 4, title: "Évaluation test" }, answerKey: null, recipients: [], candidates: [] }),
  saveAssessmentAnswerKey: vi.fn(),
  sendAssessmentAnswerKey: vi.fn(),
  getQuestionInsights: vi.fn().mockResolvedValue({ question: { id: 5, prompt: "Quel levier choisir ?" }, responses: [{ student: { id: 42, name: "Élève test" }, answer: "SEO", correct: false }] }),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, ...mocks };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function adminContext(): TrpcContext {
  return {
    user: { id: 7, openId: "admin-test", name: "Formateur", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("mutations pédagogiques formateur", () => {
  beforeEach(() => vi.clearAllMocks());

  it("transmet l’édition de module avec l’identité du formateur", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.updateModule({ id: 2, title: "Module édité", summary: "Une description pédagogique suffisamment détaillée.", sequence: 2, isPublished: true });
    expect(mocks.updateModuleContent).toHaveBeenCalledWith(expect.objectContaining({ id: 2, actorUserId: 7, isPublished: true }));
  });

  it("transmet la copie de barème et les deux demandes de reprise", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.copyRubric({ sourceAssessmentId: 4, targetAssessmentId: 8 });
    await caller.admin.requestRevision({ submissionId: 11, note: "Développez votre analyse." });
    await caller.admin.requestDeliverableRevision({ deliverableId: 12, note: "Ajoutez les sources visuelles." });
    expect(mocks.copyRubric).toHaveBeenCalledWith({ sourceAssessmentId: 4, targetAssessmentId: 8, actorUserId: 7 });
    expect(mocks.requestRevision).toHaveBeenCalledWith({ submissionId: 11, note: "Développez votre analyse.", actorUserId: 7 });
    expect(mocks.requestDeliverableRevision).toHaveBeenCalledWith({ deliverableId: 12, note: "Ajoutez les sources visuelles.", actorUserId: 7 });
  });

  it("transmet la correction manuelle de livrable avec l’identité du formateur", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.reviewDeliverable({ deliverableId: 12, score: 16, feedback: "Analyse claire ; ajoutez davantage de sources.", approved: true });
    expect(mocks.reviewDeliverable).toHaveBeenCalledWith({ deliverableId: 12, score: 16, feedback: "Analyse claire ; ajoutez davantage de sources.", approved: true, actorUserId: 7 });
  });

  it("permet au formateur de rectifier une évaluation déjà corrigée", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.reviewSubmission({ submissionId: 18, score: 15.5, feedback: "Note et commentaire rectifiés après nouvelle vérification.", approved: true });
    expect(mocks.reviewSubmission).toHaveBeenCalledWith({ submissionId: 18, score: 15.5, feedback: "Note et commentaire rectifiés après nouvelle vérification.", approved: true, actorUserId: 7 });
  });

  it("expose les évaluations déjà corrigées au formateur pour rectification", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.reviewHistory()).resolves.toMatchObject([{ submission: { id: 18, status: "reviewed", manualScore: 14 }, student: { name: "Élève test" } }]);
    expect(mocks.getReviewedSubmissions).toHaveBeenCalledOnce();
  });

  it("enregistre un corrigé type et le transmet uniquement aux apprenants sélectionnés", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.saveAnswerKey({ assessmentId: 4, content: "Réponse attendue : préciser les objectifs et les indicateurs." });
    await caller.admin.sendAnswerKey({ assessmentId: 4, studentIds: [42, 43] });
    await expect(caller.admin.answerKeyDetail({ assessmentId: 4 })).resolves.toMatchObject({ assessment: { id: 4 } });
    expect(mocks.saveAssessmentAnswerKey).toHaveBeenCalledWith({ assessmentId: 4, content: "Réponse attendue : préciser les objectifs et les indicateurs.", actorUserId: 7 });
    expect(mocks.sendAssessmentAnswerKey).toHaveBeenCalledWith({ assessmentId: 4, studentIds: [42, 43], actorUserId: 7 });
    expect(mocks.getAssessmentAnswerKeyDetail).toHaveBeenCalledWith(4);
  });

  it("autorise le formateur à consulter les réponses détaillées d’une question", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.questionInsights({ questionId: 5 })).resolves.toMatchObject({ question: { prompt: "Quel levier choisir ?" }, responses: [{ student: { name: "Élève test" }, answer: "SEO", correct: false }] });
    expect(mocks.getQuestionInsights).toHaveBeenCalledWith(5);
  });
});
