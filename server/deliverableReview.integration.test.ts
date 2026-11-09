import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDeliverableReviewDetail: vi.fn(),
  reviewDeliverable: vi.fn(),
  listLLMModels: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, getDeliverableReviewDetail: mocks.getDeliverableReviewDetail, reviewDeliverable: mocks.reviewDeliverable };
});
vi.mock("./_core/llm", () => ({ listLLMModels: mocks.listLLMModels, invokeLLM: mocks.invokeLLM }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function adminContext(): TrpcContext {
  return { user: { id: 7, openId: "admin-test", name: "Formateur", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("revue fonctionnelle d’un livrable PDF", () => {
  const detail = { deliverable: { id: 12, fileName: "travail.pdf", mimeType: "application/pdf" }, module: { title: "Module test" }, assignment: { instructions: "Analysez la situation.", expectedFormat: "PDF" }, fileUrl: "https://storage.example/travail.pdf" };

  it("retourne un lien de consultation signé pour le fichier déposé", async () => {
    mocks.getDeliverableReviewDetail.mockResolvedValue(detail);
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.deliverableReviewDetail({ deliverableId: 12 })).resolves.toMatchObject({ fileUrl: "https://storage.example/travail.pdf", deliverable: { fileName: "travail.pdf" } });
    expect(mocks.getDeliverableReviewDetail).toHaveBeenCalledWith(12);
  });

  it("envoie le PDF et la consigne à l’assistance IA pour une suggestion modifiable", async () => {
    mocks.getDeliverableReviewDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-nano" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ score: 15, feedback: "Bon travail.", strengths: ["Structure"], improvements: ["Sources"], confidence: 84 }) } }] });
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.suggestDeliverableCorrection({ deliverableId: 12 })).resolves.toMatchObject({ score: 15, confidence: 84 });
    expect(mocks.invokeLLM).toHaveBeenCalledWith(expect.objectContaining({ messages: expect.arrayContaining([expect.objectContaining({ role: "user", content: expect.arrayContaining([expect.objectContaining({ type: "file_url", file_url: { url: "https://storage.example/travail.pdf", mime_type: "application/pdf" } })]) })]) }));
  });

  it("enregistre la décision finale du formateur après consultation et suggestion", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.reviewDeliverable({ deliverableId: 12, score: 15, feedback: "Bon travail ; complétez les sources.", approved: true });
    expect(mocks.reviewDeliverable).toHaveBeenCalledWith({ deliverableId: 12, score: 15, feedback: "Bon travail ; complétez les sources.", approved: true, actorUserId: 7 });
  });

  it("couvre en un flux l’ouverture, le téléchargement, la suggestion et la correction du PDF", async () => {
    mocks.getDeliverableReviewDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-nano" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ score: 14, feedback: "À compléter.", strengths: ["Clarté"], improvements: ["Références"], confidence: 80 }) } }] });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("%PDF-test", { status: 200, headers: { "content-type": "application/pdf" } }));
    const caller = appRouter.createCaller(adminContext());
    const review = await caller.admin.deliverableReviewDetail({ deliverableId: 12 });
    const downloadUrl = review.fileUrl;
    expect(new URL(downloadUrl).pathname).toContain("travail.pdf");
    const download = await fetch(downloadUrl);
    expect(download.ok).toBe(true);
    expect(download.headers.get("content-type")).toContain("application/pdf");
    const suggestion = await caller.admin.suggestDeliverableCorrection({ deliverableId: 12 });
    await caller.admin.reviewDeliverable({ deliverableId: 12, score: suggestion.score, feedback: suggestion.feedback, approved: true });
    expect(mocks.invokeLLM).toHaveBeenCalled();
    expect(mocks.reviewDeliverable).toHaveBeenLastCalledWith({ deliverableId: 12, score: 14, feedback: "À compléter.", approved: true, actorUserId: 7 });
    fetchMock.mockRestore();
  });

  it("propose une suggestion prudente lorsque la lecture directe du PDF échoue", async () => {
    mocks.getDeliverableReviewDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gemini-3-flash-preview" }, { id: "gpt-5-mini" }] });
    const callStart = mocks.invokeLLM.mock.calls.length;
    mocks.invokeLLM.mockRejectedValueOnce(new Error("Lecture PDF indisponible")).mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify({ score: 10, feedback: "Vérifiez le contenu du document avant validation.", strengths: [], improvements: ["Ajoutez des sources"], confidence: 40 }) } }] });
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.suggestDeliverableCorrection({ deliverableId: 12 })).resolves.toMatchObject({ score: 10, confidence: 40 });
    expect(mocks.invokeLLM.mock.calls).toHaveLength(callStart + 2);
    expect(mocks.invokeLLM.mock.calls[callStart + 1][0]).toMatchObject({ model: "gpt-5-mini" });
    expect(mocks.invokeLLM.mock.calls[callStart + 1][0].messages[1].content).toEqual(expect.any(String));
  });

  it("reste disponible lorsque le modèle renvoie un JSON incomplet", async () => {
    mocks.getDeliverableReviewDetail.mockResolvedValue(detail);
    mocks.listLLMModels.mockResolvedValue({ data: [{ id: "gpt-5-mini" }] });
    mocks.invokeLLM.mockResolvedValue({ choices: [{ message: { content: '{"score": 17, "feedback": "Analyse interrompue"' } }] });
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.suggestDeliverableCorrection({ deliverableId: 12 })).resolves.toMatchObject({
      score: 10,
      confidence: 20,
      feedback: expect.stringContaining("lecture automatique"),
    });
  });
});
