import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

const submissionId = Number(process.argv[2]);
if (!Number.isInteger(submissionId) || submissionId <= 0) {
  throw new Error("Usage : pnpm tsx scripts/verify-assessment-suggestion.mts <submissionId>");
}

const context: TrpcContext = {
  user: {
    id: 7,
    openId: "verification-admin",
    name: "Formateur de vérification",
    email: "verification@example.com",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

const suggestion = await appRouter.createCaller(context).admin.suggestCorrection({ submissionId });
if (!Number.isFinite(suggestion.score) || !Number.isFinite(suggestion.confidence) || !suggestion.feedback.trim()) {
  throw new Error("La suggestion retournée est inexploitable.");
}

console.log(JSON.stringify({ submissionId, score: suggestion.score, confidence: suggestion.confidence, feedbackLength: suggestion.feedback.length }));
