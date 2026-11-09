import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getDb,
  upsertUser,
  getUserByOpenId,
  createDeliverable,
  copyRubric,
  addAssessmentQuestion,
  addLearningResource,
  createModule,
  getCohortAnalytics,
  getCohortCsv,
  getQuestionInsights,
  getAssessmentLibrary,
  getAssessmentAnswerKeyDetail,
  getContentLibrary,
  getDeliverableReviewDetail,
  getDeliverableReviewQueue,
  getNotificationsForUser,
  getStudentProfile,
  getStudentEnrollment,
  getProgramForStudent,
  getReviewQueue,
  getReviewedSubmissions,
  getStudentHistory,
  getStudentModule,
  getStudentOverview,
  getSubmissionForReview,
  markNotificationRead,
  requestRevision,
  requestDeliverableRevision,
  reviewDeliverable,
  reviewSubmission,
  saveRubric,
  saveAssessmentAnswerKey,
  saveAssessmentSubmission,
  setStudentEnrollment,
  requestStudentEnrollment,
  setStudentOverride,
  sendAssessmentAnswerKey,
  updateAssessmentContent,
  updateAssignmentContent,
  updateModuleContent,
  updateStudentProfile,
  upsertLesson,
} from "./db";
import { previewWorkbench } from "./workbenchPreview";
import { getWorkbenchStudent, getWorkbenchAdmin, startWorkbench, saveWorkbench, submitWorkbench, reviewWorkbench, setWorkbenchPublished, enableWorkbenchHeartbeat } from "./workbenchService";
import { parse as parseCookie } from "cookie";
import { storagePut } from "./storage";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { sdk } from "./_core/sdk";
import { INTAKE_ONE, INTAKE_TWO } from "@shared/cohort";

const answerSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())]));
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
    demoLogin: publicProcedure
      .input(
        z.object({
          role: z.enum(["admin", "student_gms", "student_bd"]),
          name: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const openId =
          input.role === "admin"
            ? "demo-admin-01"
            : input.role === "student_gms"
              ? "demo-student-gms-01"
              : "demo-student-bd-01";
        const name =
          input.name ||
          (input.role === "admin"
            ? "Formateur Campus"
            : input.role === "student_gms"
              ? "Apprenant Médias Sociaux"
              : "Apprenant Business Digital");
        const email =
          input.role === "admin"
            ? "formateur@campusmedias.com"
            : input.role === "student_gms"
              ? "etudiant.gms@campusmedias.com"
              : "etudiant.bd@campusmedias.com";
        const cohort =
          input.role === "student_gms"
            ? "Gestion des médias sociaux"
            : "Business digital";

        try {
          const dbInstance = await getDb();
          if (dbInstance) {
            await upsertUser({
              openId,
              name,
              email,
              role: input.role === "admin" ? "admin" : "user",
              loginMethod: "demo",
              lastSignedIn: new Date(),
            });
            const user = await getUserByOpenId(openId);
            if (user && input.role !== "admin") {
              await setStudentEnrollment({
                userId: user.id,
                cohort: cohort as any,
                status: "active",
                intake: INTAKE_ONE,
              });
            }
          }
        } catch {
          // If DB is temporarily offline, sdk handles the in-memory fallback
        }

        const token = await sdk.createSessionToken(openId, { name });
        ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));
        return {
          success: true,
          openId,
          name,
          role: input.role === "admin" ? "admin" : "user",
        };
      }),
  }),
  student: router({
    enrollment: protectedProcedure.query(({ ctx }) => getStudentEnrollment(ctx.user.id)),
    requestEnrollment: protectedProcedure.input(z.object({
      cohort: z.enum(["Gestion des médias sociaux", "Business digital"]),
      intake: z.enum([INTAKE_ONE, INTAKE_TWO]),
    })).mutation(({ ctx, input }) => requestStudentEnrollment({ userId: ctx.user.id, ...input })),
    profile: protectedProcedure.query(({ ctx }) => getStudentProfile(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({
      name: z.string().trim().min(2, "Indiquez au moins deux caractères pour votre nom.").max(120),
      age: z.number().int().min(13, "L’âge doit être compris entre 13 et 120 ans.").max(120).nullable(),
    })).mutation(({ ctx, input }) => updateStudentProfile({ userId: ctx.user.id, ...input })),
    program: protectedProcedure.query(({ ctx }) => getProgramForStudent(ctx.user.id)),
    module: protectedProcedure.input(z.object({ moduleId: z.number().int().positive() }))
      .query(({ ctx, input }) => getStudentModule(ctx.user.id, input.moduleId)),
    saveAssessment: protectedProcedure.input(z.object({ moduleId: z.number().int().positive(), answers: answerSchema, submit: z.boolean() }))
      .mutation(({ ctx, input }) => saveAssessmentSubmission({ studentId: ctx.user.id, ...input })),
    uploadDeliverable: protectedProcedure.input(z.object({
      moduleId: z.number().int().positive(),
      fileName: z.string().min(1).max(180),
      mimeType: z.string().min(1).max(128),
      dataBase64: z.string().min(1).max(14_000_000),
    })).mutation(async ({ ctx, input }) => {
      if (!allowedMimeTypes.has(input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Formats acceptés : PDF, Word et texte." });
      }
      const buffer = Buffer.from(input.dataBase64, "base64");
      if (buffer.byteLength > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Le fichier ne doit pas dépasser 10 Mo." });
      }
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const { key, url } = await storagePut(`eleves/${ctx.user.id}/livrables/${input.moduleId}/${safeName}`, buffer, input.mimeType);
      await createDeliverable({
        studentId: ctx.user.id,
        moduleId: input.moduleId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: buffer.byteLength,
        fileKey: key,
        url,
      });
      return { key, url, fileName: input.fileName };
    }),
    notifications: protectedProcedure.query(({ ctx }) => getNotificationsForUser(ctx.user.id)),
    markNotificationRead: protectedProcedure.input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),
    history: protectedProcedure.query(({ ctx }) => getStudentHistory(ctx.user.id)),
    formativeSimulation: protectedProcedure.query(({ ctx }) => getWorkbenchStudent(ctx.user.id)),
    startFormativeSimulation: protectedProcedure.mutation(({ ctx }) => startWorkbench(ctx.user.id)),
    saveFormativeWorkshop: protectedProcedure.input(z.object({ workshopId: z.string().min(1).max(64), answer: z.record(z.string().max(100), z.string().max(12000)).refine(a => Object.keys(a).length <= 150, "Trop de champs."), commit: z.boolean() }))
      .mutation(({ ctx, input }) => saveWorkbench({ studentId: ctx.user.id, ...input })),
    finalizeFormativeSimulation: protectedProcedure.mutation(({ ctx }) => submitWorkbench(ctx.user.id)),
  }),
  admin: router({
    overview: adminProcedure.query(() => getStudentOverview()),
    contentLibrary: adminProcedure.query(() => getContentLibrary()),
    cohortAnalytics: adminProcedure.input(z.object({ cohort: z.enum(["Gestion des médias sociaux", "Business digital"]).optional() }).optional()).query(({ input }) => getCohortAnalytics(input?.cohort)),
    questionInsights: adminProcedure.input(z.object({ questionId: z.number().int().positive() })).query(({ input }) => getQuestionInsights(input.questionId)),
    cohortCsv: adminProcedure.input(z.object({ cohort: z.enum(["Gestion des médias sociaux", "Business digital"]).optional() }).optional()).query(({ input }) => getCohortCsv(input?.cohort)),
    formativeSimulation: adminProcedure.query(() => getWorkbenchAdmin()),
    testFormativeWorkshop: adminProcedure.input(z.object({ answers: z.record(z.string().max(64), z.record(z.string().max(100), z.string().max(12000))).refine(a => Object.keys(a).length <= 12) })).mutation(({input}) => previewWorkbench(input.answers)),
    reviewFormativeWorkshop: adminProcedure.input(z.object({ attemptId: z.number().int().positive(), score: z.number().min(0).max(20), feedback: z.string().trim().min(5).max(10000) })).mutation(({ctx,input}) => reviewWorkbench({...input,actorId:ctx.user.id})),
    setSimulationPublished: adminProcedure.input(z.object({ isPublished: z.boolean() })).mutation(({input}) => setWorkbenchPublished(input.isPublished)),
    enableSimulationClosure: adminProcedure.mutation(({ctx}) => enableWorkbenchHeartbeat(parseCookie(ctx.req.headers.cookie || "")[COOKIE_NAME] || "")),
    createModule: adminProcedure.input(z.object({
      code: z.string().min(2).max(16).regex(/^[A-Z0-9_-]+$/),
      sequence: z.number().int().min(1).max(99),
      title: z.string().min(3).max(255),
      summary: z.string().min(10).max(5000),
    })).mutation(({ ctx, input }) => createModule({ ...input, actorUserId: ctx.user.id })),
    updateModule: adminProcedure.input(z.object({
      id: z.number().int().positive(), title: z.string().min(3).max(255), summary: z.string().min(10).max(5000), sequence: z.number().int().min(1).max(99), isPublished: z.boolean(),
    })).mutation(({ ctx, input }) => updateModuleContent({ ...input, actorUserId: ctx.user.id })),
    saveLesson: adminProcedure.input(z.object({
      id: z.number().int().positive().optional(), moduleId: z.number().int().positive(), sequence: z.number().int().min(1).max(99), title: z.string().min(3).max(255), duration: z.string().max(32).optional().default(""), summary: z.string().min(3).max(5000),
    })).mutation(({ ctx, input }) => upsertLesson({ ...input, actorUserId: ctx.user.id })),
    updateAssignment: adminProcedure.input(z.object({
      moduleId: z.number().int().positive(), title: z.string().min(3).max(255), instructions: z.string().min(10).max(10000), expectedFormat: z.string().min(3).max(3000), dueAt: z.coerce.date().nullable().optional(), allowResubmission: z.boolean(),
    })).mutation(({ ctx, input }) => updateAssignmentContent({ ...input, actorUserId: ctx.user.id })),
    updateAssessment: adminProcedure.input(z.object({
      id: z.number().int().positive(), title: z.string().min(3).max(255), instructions: z.string().min(10).max(10000), dueAt: z.coerce.date().nullable().optional(), allowRetake: z.boolean(), isOpen: z.boolean(),
    })).mutation(({ ctx, input }) => updateAssessmentContent({ ...input, actorUserId: ctx.user.id })),
    addResource: adminProcedure.input(z.object({
      moduleId: z.number().int().positive(), title: z.string().min(3).max(255), description: z.string().max(2000).optional(), type: z.enum(["link", "note"]), url: z.string().url().max(1024).optional(), content: z.string().max(10000).optional(),
    }).superRefine((value, ctx) => {
      if (value.type === "link" && !value.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Ajoutez un lien pour cette ressource." });
      if (value.type === "note" && !value.content) ctx.addIssue({ code: "custom", path: ["content"], message: "Ajoutez le contenu de cette note." });
    })).mutation(({ ctx, input }) => addLearningResource({ ...input, actorUserId: ctx.user.id })),
    saveRubric: adminProcedure.input(z.object({
      assessmentId: z.number().int().positive(), title: z.string().min(3).max(255), description: z.string().max(3000).optional(), criteria: z.array(z.object({ label: z.string().min(2).max(255), description: z.string().max(2000).optional(), maxPoints: z.number().int().min(1).max(50) })).max(12),
    })).mutation(({ ctx, input }) => saveRubric({ ...input, actorUserId: ctx.user.id })),
    copyRubric: adminProcedure.input(z.object({ sourceAssessmentId: z.number().int().positive(), targetAssessmentId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => copyRubric({ ...input, actorUserId: ctx.user.id })),
    assessmentLibrary: adminProcedure.query(() => getAssessmentLibrary()),
    answerKeyDetail: adminProcedure.input(z.object({ assessmentId: z.number().int().positive() })).query(({ input }) => getAssessmentAnswerKeyDetail(input.assessmentId)),
    suggestAnswerKey: adminProcedure.input(z.object({ assessmentId: z.number().int().positive(), guidance: z.string().trim().max(3_000).optional() })).mutation(async ({ input }) => {
      const detail = await getAssessmentAnswerKeyDetail(input.assessmentId);
      const fallback = detail.questions.map((question, index) => `## Question ${index + 1} — ${question.prompt}\n\n${question.correctAnswers?.length ? `**Réponse attendue :** ${question.correctAnswers.join(" ; ")}` : "**Éléments attendus :** une réponse structurée, contextualisée, justifiée par les notions du module et conclue par des recommandations applicables."}`).join("\n\n");
      const catalog = await listLLMModels();
      const model = catalog.data.find(item => item.id === "gpt-5-mini")?.id ?? catalog.data.find(item => item.id === "gpt-5-nano")?.id ?? catalog.data[0]?.id;
      if (!model) return { content: fallback, confidence: 20 };
      try {
        const response = await invokeLLM({
          model,
          max_completion_tokens: 2_400,
          reasoning: { effort: "minimal" },
          messages: [
            { role: "system", content: "Vous êtes un formateur expert francophone. Rédigez un corrigé type pédagogique, factuel et immédiatement exploitable. Respectez strictement les réponses correctes fournies ; ne fabriquez ni statistiques ni sources. Pour chaque question, donnez la réponse ou les éléments attendus, une justification concise et, pour la rédaction, une grille de raisonnement attendue. Respectez les consignes de présentation du formateur uniquement si elles restent compatibles avec ces règles. Rédigez uniquement le corrigé en français avec des titres Markdown." },
            { role: "user", content: JSON.stringify({ evaluation: detail.assessment.title, consignes: detail.assessment.instructions, consignesDuFormateur: input.guidance || "Aucune consigne supplémentaire.", questions: detail.questions.map(question => ({ type: question.type, question: question.prompt, choix: question.options, bonnesReponses: question.correctAnswers, points: question.maxPoints })) }) },
          ],
        });
        const content = response.choices[0]?.message.content;
        if (!content || typeof content !== "string" || content.trim().length < 80) return { content: fallback, confidence: 20 };
        return { content: content.trim(), confidence: 75 };
      } catch (error) {
        console.warn("La suggestion IA de corrigé type a échoué ; proposition de base fournie.", error);
        return { content: fallback, confidence: 20 };
      }
    }),
    saveAnswerKey: adminProcedure.input(z.object({ assessmentId: z.number().int().positive(), content: z.string().min(1).max(12000) })).mutation(({ ctx, input }) => saveAssessmentAnswerKey({ ...input, actorUserId: ctx.user.id })),
    sendAnswerKey: adminProcedure.input(z.object({ assessmentId: z.number().int().positive(), studentIds: z.array(z.number().int().positive()).min(1) })).mutation(({ ctx, input }) => sendAssessmentAnswerKey({ ...input, actorUserId: ctx.user.id })),
    addQuestion: adminProcedure.input(z.object({
      assessmentId: z.number().int().positive(),
      type: z.enum(["single", "multiple", "essay"]),
      prompt: z.string().min(10).max(3000),
      options: z.array(z.string().min(1).max(500)).max(8).optional(),
      correctAnswers: z.array(z.string().min(1).max(500)).max(8).optional(),
      maxPoints: z.number().int().min(1).max(50),
    }).superRefine((value, ctx) => {
      if (value.type !== "essay" && (!value.options || value.options.length < 2)) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Ajoutez au moins deux propositions." });
      }
      if (value.type !== "essay" && (!value.correctAnswers || value.correctAnswers.length === 0)) {
        ctx.addIssue({ code: "custom", path: ["correctAnswers"], message: "Indiquez la ou les bonnes réponses." });
      }
    })).mutation(({ input }) => addAssessmentQuestion(input)),
    reviewQueue: adminProcedure.query(() => getReviewQueue()),
    reviewHistory: adminProcedure.query(() => getReviewedSubmissions()),
    deliverableQueue: adminProcedure.query(() => getDeliverableReviewQueue()),
    deliverableReviewDetail: adminProcedure.input(z.object({ deliverableId: z.number().int().positive() }))
      .query(({ input }) => getDeliverableReviewDetail(input.deliverableId)),
    reviewDetail: adminProcedure.input(z.object({ submissionId: z.number().int().positive() }))
      .query(({ input }) => getSubmissionForReview(input.submissionId)),
    reviewSubmission: adminProcedure.input(z.object({
      submissionId: z.number().int().positive(),
      score: z.number().min(0).max(20),
      feedback: z.string().max(4000),
      approved: z.boolean(),
    })).mutation(({ ctx, input }) => reviewSubmission({ ...input, actorUserId: ctx.user.id })),
    requestRevision: adminProcedure.input(z.object({ submissionId: z.number().int().positive(), note: z.string().max(4000) }))
      .mutation(({ ctx, input }) => requestRevision({ ...input, actorUserId: ctx.user.id })),
    requestDeliverableRevision: adminProcedure.input(z.object({ deliverableId: z.number().int().positive(), note: z.string().max(4000) }))
      .mutation(({ ctx, input }) => requestDeliverableRevision({ ...input, actorUserId: ctx.user.id })),
    reviewDeliverable: adminProcedure.input(z.object({ deliverableId: z.number().int().positive(), score: z.number().min(0).max(20), feedback: z.string().max(4000), approved: z.boolean() }))
      .mutation(({ ctx, input }) => reviewDeliverable({ ...input, actorUserId: ctx.user.id })),
    setOverride: adminProcedure.input(z.object({
      studentId: z.number().int().positive(),
      moduleId: z.number().int().positive(),
      state: z.enum(["locked", "unlocked"]),
      note: z.string().max(500).optional(),
    })).mutation(({ input }) => setStudentOverride(input)),
    setEnrollment: adminProcedure.input(z.object({
      userId: z.number().int().positive(),
      status: z.enum(["active", "suspended"]),
      cohort: z.enum(["Gestion des médias sociaux", "Business digital"]).optional(),
      intake: z.enum([INTAKE_ONE, INTAKE_TWO]).optional(),
    })).mutation(({ input }) => setStudentEnrollment(input)),
    suggestCorrection: adminProcedure.input(z.object({ submissionId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const detail = await getSubmissionForReview(input.submissionId);
        const catalog = await listLLMModels();
        const model = catalog.data.find(item => item.id === "gpt-5-mini")?.id
          ?? catalog.data.find(item => item.id === "gpt-5-nano")?.id
          ?? catalog.data[0]?.id;
        if (!model) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Aucun modèle d’assistance n’est disponible." });
        const fallback = { score: detail.submission.autoScore ?? 10, feedback: "L’assistant ne peut pas détailler cette correction pour le moment. Vérifiez les réponses de l’élève, puis adaptez librement cette note et ce commentaire avant validation.", strengths: ["Réponses disponibles pour revue"], improvements: ["Vérifier chaque réponse au regard de la consigne"], confidence: 20 };
        try {
        const response = await invokeLLM({
          model,
          max_completion_tokens: 1_600,
          reasoning: { effort: "minimal" },
          messages: [
            { role: "system", content: "Vous êtes un assistant de correction pédagogique francophone. Rédigez exclusivement en français, avec un ton professionnel et concret. Votre analyse est une suggestion, jamais une décision finale. Évaluez équitablement les réponses réellement fournies, ne pénalisez pas la forme lorsque le fond est correct et n’inventez aucune information. Le champ confidence doit être un pourcentage entier entre 0 et 100." },
            { role: "user", content: JSON.stringify({
              evaluation: detail.assessment?.title,
              instructions: detail.assessment?.instructions,
              questions: detail.questions.map(question => ({ id: question.id, prompt: question.prompt, maxPoints: question.maxPoints, type: question.type, correctAnswers: question.correctAnswers })),
              answers: detail.submission.answers,
              autoScore: detail.submission.autoScore,
              task: "Proposez une note globale sur 20, une justification concise, trois forces au maximum, trois améliorations au maximum et un niveau de confiance entre 0 et 100.",
            }), },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "suggestion_correction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  score: { type: "number", minimum: 0, maximum: 20 },
                  feedback: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  confidence: { type: "number", minimum: 0, maximum: 100 },
                },
                required: ["score", "feedback", "strengths", "improvements", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices[0]?.message.content;
        if (!content || typeof content !== "string") {
          return fallback;
        }
        try {
          const json = content.match(/\{[\s\S]*\}/)?.[0] ?? content;
          const suggestion = JSON.parse(json) as { score: number; feedback: string; strengths: string[]; improvements: string[]; confidence: number };
          if (!Number.isFinite(suggestion.score) || !suggestion.feedback?.trim() || !Array.isArray(suggestion.strengths) || !Array.isArray(suggestion.improvements) || !Number.isFinite(suggestion.confidence)) {
            return fallback;
          }
          return {
            ...suggestion,
            score: Math.max(0, Math.min(20, Math.round(suggestion.score * 10) / 10)),
            confidence: Math.max(0, Math.min(100, Math.round(suggestion.confidence <= 1 ? suggestion.confidence * 100 : suggestion.confidence))),
          };
        } catch (parseError) {
          console.warn("La réponse IA d’évaluation n’est pas un JSON exploitable ; suggestion prudente fournie.", parseError);
          return fallback;
        }
        } catch (suggestionError) {
          console.warn("La suggestion IA d’évaluation a échoué ; suggestion prudente fournie.", suggestionError);
          return fallback;
        }
      }),
    suggestDeliverableCorrection: adminProcedure.input(z.object({ deliverableId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const detail = await getDeliverableReviewDetail(input.deliverableId);
        const catalog = await listLLMModels();
        const model = catalog.data.find(item => item.id === "gemini-3-flash-preview")?.id
          ?? catalog.data.find(item => item.id === "gemini-3.1-pro-preview")?.id
          ?? catalog.data.find(item => item.id === "gpt-5-mini")?.id
          ?? catalog.data[0]?.id;
        if (!model) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Aucun modèle d’assistance n’est disponible." });
        const responseFormat = {
          type: "json_schema" as const,
          json_schema: {
            name: "deliverable_correction_suggestion",
            strict: true,
            schema: {
              type: "object",
              properties: {
                score: { type: "number", minimum: 0, maximum: 20 },
                feedback: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                confidence: { type: "number", minimum: 0, maximum: 100 },
              },
              required: ["score", "feedback", "strengths", "improvements", "confidence"],
              additionalProperties: false,
            },
          },
        };
        const requestContext = { livrable: detail.deliverable.fileName, module: detail.module?.title, consigne: detail.assignment?.instructions, formatAttendu: detail.assignment?.expectedFormat, task: "Proposez une note sur 20, un commentaire concis, trois forces au maximum, trois améliorations au maximum et un niveau de confiance entre 0 et 100." };
        let response;
        try {
          response = await invokeLLM({
            model,
            maxTokens: 900,
            messages: [
              { role: "system", content: "Vous êtes un assistant de correction pédagogique. Votre analyse est une suggestion modifiable par le formateur. Évaluez la pertinence, la structure et la qualité de la réponse au regard de la consigne. N’inventez aucun élément absent du document." },
              { role: "user", content: [
                { type: "text", text: JSON.stringify(requestContext) },
                { type: "file_url", file_url: { url: detail.fileUrl, mime_type: detail.deliverable.mimeType as "application/pdf" } },
              ] },
            ],
            response_format: responseFormat,
          });
        } catch (fileReadError) {
          console.warn("La lecture IA du PDF a échoué ; repli sur la consigne de correction.", fileReadError);
          response = await invokeLLM({
            model: catalog.data.find(item => item.id === "gpt-5-mini")?.id ?? model,
            maxTokens: 900,
            messages: [
              { role: "system", content: "Vous êtes un assistant de correction pédagogique. Le fichier ne peut pas être lu automatiquement. Fournissez une suggestion prudente et modifiable, fondée seulement sur la consigne, le format attendu et les métadonnées. Mentionnez explicitement dans le commentaire que le formateur doit vérifier le contenu du document." },
              { role: "user", content: JSON.stringify(requestContext) },
            ],
            response_format: responseFormat,
          });
        }
        const content = response.choices[0]?.message.content;
        if (!content || typeof content !== "string") {
          return { score: 10, feedback: "Le document a été reçu, mais l’assistant ne peut pas produire une analyse détaillée pour le moment. Vérifiez le contenu avant de valider la note.", strengths: ["Livrable reçu"], improvements: ["Vérifier le contenu du document"], confidence: 15 };
        }
        try {
          const json = content.match(/\{[\s\S]*\}/)?.[0] ?? content;
          return JSON.parse(json) as { score: number; feedback: string; strengths: string[]; improvements: string[]; confidence: number };
        } catch (parseError) {
          console.warn("La réponse IA de correction n’est pas un JSON exploitable ; suggestion prudente fournie.", parseError);
          return { score: 10, feedback: "La lecture automatique du document est incomplète. Utilisez cette base prudente, puis vérifiez le contenu du livrable avant d’enregistrer votre correction.", strengths: ["Livrable disponible pour revue"], improvements: ["Vérifier la conformité à la consigne", "Compléter le commentaire après lecture"], confidence: 20 };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
