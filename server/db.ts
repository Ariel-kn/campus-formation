import { and, asc, desc, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  assessmentAnswerKeyRecipients,
  assessmentAnswerKeys,
  assessmentQuestions,
  assessments,
  assessmentSubmissions,
  assignments,
  courseModules,
  deliverables,
  enrollments,
  InsertUser,
  learningActivityLogs,
  learningResources,
  lessons,
  progressOverrides,
  rubricCriteria,
  rubrics,
  appNotifications,
  formativeSimulationChoices,
  formativeSimulationSteps,
  formativeSimulations,
  formativeSimulationAttempts,
  users,
} from "../drizzle/schema";
import { isEnrollmentAuthorized } from "../shared/access";
import { INTAKE_ONE, IntakeName, modulesForCohort } from "../shared/cohort";
import { canCopyRubric, canPublishContent, canRequestRetry, canSubmitAnotherVersion, isSubmittedLate } from "../shared/pedagogy";
import { canAccessModule } from "../shared/progression";
import { curriculum } from "./courseSeed";
import { BUSINESS_DIGITAL_COHORT, businessDigitalCurriculum } from "./businessDigitalSeed";
import { detailedCourseContent } from "./courseContent";
import { ENV } from "./_core/env";
import { storageGetSignedUrl } from "./storage";
import { FORMATIVE_SIMULATION_CODE, FORMATIVE_SIMULATION_DURATION_SECONDS, nayaSimulationSteps } from "./simulationSeed";

let _db: ReturnType<typeof drizzle> | null = null;

/** Point d’injection réservé aux tests de règles d’accès et de progression. */
export function setDbForTests(db: ReturnType<typeof drizzle> | null) {
  _db = db;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({ id: users.id, name: users.name, age: users.age, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0];
}

export async function updateStudentProfile(input: { userId: number; name: string; age: number | null }) {
  const db = await getDb();
  if (!db) throw new Error("La mise à jour du profil est indisponible pour le moment.");
  await db.update(users).set({ name: input.name, age: input.age }).where(eq(users.id, input.userId));
  return getStudentProfile(input.userId);
}

export async function ensureCurriculum() {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const ensureTrack = async (cohort: string, seed: typeof curriculum) => {
    for (const module of seed) {
      const existing = await db.select().from(courseModules).where(eq(courseModules.code, module.code)).limit(1);
      if (existing.length > 0) continue;
      await db.insert(courseModules).values({
        code: module.code,
        cohort,
        sequence: module.sequence,
        title: module.title,
        summary: module.summary,
      });
      const inserted = await db.select().from(courseModules).where(eq(courseModules.code, module.code)).limit(1);
      const moduleId = inserted[0]?.id;
      if (!moduleId) throw new Error("Impossible d’initialiser le programme.");

      if (module.lessons.length > 0) {
        await db.insert(lessons).values(module.lessons.map((lesson: any, index: number) => ({
          moduleId,
          sequence: index + 1,
          ...lesson,
        })));
      }
      await db.insert(assignments).values({ moduleId, ...module.assignment });
      await db.insert(assessments).values({
        moduleId,
        title: module.assessment.title,
        instructions: module.assessment.instructions,
        maxScore: 20,
      });
      const insertedAssessment = await db.select().from(assessments).where(eq(assessments.moduleId, moduleId)).limit(1);
      const assessmentId = insertedAssessment[0]?.id;
      if (!assessmentId) throw new Error("Impossible d’initialiser l’évaluation.");
      await db.insert(assessmentQuestions).values(module.assessment.questions.map((question: any, index: number) => ({
        assessmentId,
        sequence: index + 1,
        type: question.type,
        prompt: question.prompt,
        options: question.options,
        correctAnswers: question.correctAnswers,
        maxPoints: question.maxPoints,
      })));
    }
  };
  await ensureTrack("Gestion des médias sociaux", curriculum);
  await ensureTrack(BUSINESS_DIGITAL_COHORT, businessDigitalCurriculum);
  const summativeSeed = businessDigitalCurriculum.find(module => module.code === "BD7");
  const [summativeModule] = await db.select().from(courseModules).where(eq(courseModules.code, "BD7")).limit(1);
  if (summativeSeed && summativeModule) {
    const [summativeAssessment] = await db.select().from(assessments).where(eq(assessments.moduleId, summativeModule.id)).limit(1);
    if (summativeAssessment) {
      await db.update(assessments).set({ title: summativeSeed.assessment.title, instructions: summativeSeed.assessment.instructions }).where(eq(assessments.id, summativeAssessment.id));
      const [existingSubmission] = await db.select({ id: assessmentSubmissions.id }).from(assessmentSubmissions).where(eq(assessmentSubmissions.assessmentId, summativeAssessment.id)).limit(1);
      const existingQuestions = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, summativeAssessment.id)).orderBy(asc(assessmentQuestions.sequence));
      if (!existingSubmission && existingQuestions.length === summativeSeed.assessment.questions.length) {
        await Promise.all(summativeSeed.assessment.questions.map((question: any, index: number) => db.update(assessmentQuestions).set({ type: question.type, prompt: question.prompt, options: question.options, correctAnswers: question.correctAnswers, maxPoints: question.maxPoints }).where(eq(assessmentQuestions.id, existingQuestions[index]!.id))));
      }
    }
  }
  const allModules = await db.select({ id: courseModules.id, code: courseModules.code }).from(courseModules);
  const moduleIds = allModules.map(module => module.id);
  const existingResources = moduleIds.length ? await db.select({ moduleId: learningResources.moduleId, title: learningResources.title }).from(learningResources).where(inArray(learningResources.moduleId, moduleIds)) : [];
  for (const module of allModules) {
    const content = detailedCourseContent[module.code];
    const exists = existingResources.some(resource => resource.moduleId === module.id && resource.title === "Support de cours détaillé");
    if (content && !exists) {
      await db.insert(learningResources).values({ moduleId: module.id, title: "Support de cours détaillé", description: "Repères, méthodes et points d’application à maîtriser pour ce module.", type: "note", content, sequence: 1 });
    }
  }
}

async function loadProgramData(studentId: number) {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const enrollment = await db.select().from(enrollments).where(eq(enrollments.userId, studentId)).limit(1);
  const cohort = enrollment[0]?.cohort ?? "Gestion des médias sociaux";
  const intake = (enrollment[0]?.intake as IntakeName | undefined) ?? INTAKE_ONE;
  const queriedModules = await db.select().from(courseModules).where(eq(courseModules.cohort, cohort)).orderBy(asc(courseModules.sequence));
  const modules = modulesForCohort(queriedModules, cohort);
  const moduleIds = modules.map(module => module.id);
  const [moduleLessons, moduleAssignments, moduleAssessments, submissions, overrides, studentDeliverables, moduleResources] = await Promise.all([
    db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).orderBy(asc(lessons.sequence)),
    db.select().from(assignments).where(inArray(assignments.moduleId, moduleIds)),
    db.select().from(assessments).where(inArray(assessments.moduleId, moduleIds)),
    db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.studentId, studentId)),
    db.select().from(progressOverrides).where(eq(progressOverrides.studentId, studentId)),
    db.select().from(deliverables).where(eq(deliverables.studentId, studentId)).orderBy(desc(deliverables.submittedAt)),
    db.select().from(learningResources).where(inArray(learningResources.moduleId, moduleIds)).orderBy(asc(learningResources.sequence)),
  ]);
  const assessmentIds = moduleAssessments.map(assessment => assessment.id);
  const recipientRows = assessmentIds.length
    ? await db.select().from(assessmentAnswerKeyRecipients).where(eq(assessmentAnswerKeyRecipients.studentId, studentId))
    : [];
  const answerKeyIds = recipientRows.map(item => item.answerKeyId);
  const allowedAnswerKeys = answerKeyIds.length
    ? await db.select().from(assessmentAnswerKeys).where(inArray(assessmentAnswerKeys.id, answerKeyIds))
    : [];
  return { cohort, intake, modules, moduleLessons, moduleAssignments, moduleAssessments, submissions, overrides, studentDeliverables, moduleResources, allowedAnswerKeys };
}

async function assertActiveEnrollment(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const enrollment = await db.select().from(enrollments).where(eq(enrollments.userId, studentId)).limit(1);
  if (!isEnrollmentAuthorized(enrollment[0])) {
    throw new Error("Votre accès à la filière doit être activé par le formateur.");
  }
}

export async function getProgramForStudent(studentId: number, enforceEnrollment = true) {
  if (enforceEnrollment) await assertActiveEnrollment(studentId);
  const data = await loadProgramData(studentId);
  return data.modules.filter(module => module.isPublished).map((module, index) => {
    const assessment = data.moduleAssessments.find(item => item.moduleId === module.id);
    const submission = assessment ? data.submissions.find(item => item.assessmentId === assessment.id) : undefined;
    const override = data.overrides.find(item => item.moduleId === module.id)?.state;
    const previousModule = data.modules[index - 1];
    const previousAssessment = previousModule ? data.moduleAssessments.find(item => item.moduleId === previousModule.id) : undefined;
    const previousSubmission = previousAssessment ? data.submissions.find(item => item.assessmentId === previousAssessment.id) : undefined;
    const isUnlocked = canAccessModule({
      sequence: module.sequence,
      firstSequence: data.modules[0]?.sequence ?? 1,
      predecessorApproved: previousSubmission?.status === "reviewed" && previousSubmission.approved,
      override,
    });
    return {
      ...module,
      intake: data.intake,
      lessons: data.moduleLessons.filter(item => item.moduleId === module.id),
      assignment: data.moduleAssignments.find(item => item.moduleId === module.id),
      assessment,
      submission,
      answerKey: assessment ? data.allowedAnswerKeys.find(item => item.assessmentId === assessment.id) : undefined,
      deliverables: data.studentDeliverables.filter(item => item.moduleId === module.id),
      resources: data.moduleResources.filter(item => item.moduleId === module.id),
      override,
      isUnlocked,
      predecessorApproved: previousSubmission?.status === "reviewed" && previousSubmission.approved,
    };
  });
}

export async function getStudentModule(studentId: number, moduleId: number) {
  const modules = await getProgramForStudent(studentId);
  const module = modules.find(item => item.id === moduleId);
  if (!module) throw new Error("Module introuvable.");
  if (!module.isUnlocked) throw new Error("Ce module est verrouillé jusqu’à validation du précédent parcours.");
  const db = await getDb();
  if (!db || !module.assessment) throw new Error("Évaluation introuvable.");
  const questions = await db.select().from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, module.assessment.id))
    .orderBy(asc(assessmentQuestions.sequence));
  return {
    ...module,
    questions: questions.map(({ correctAnswers: _correctAnswers, ...question }) => question),
  };
}

async function logLearningActivity(input: {
  actorUserId?: number | null;
  studentId?: number | null;
  moduleId?: number | null;
  action: "deliverable_submitted" | "deliverable_reviewed" | "assessment_submitted" | "assessment_reviewed" | "revision_requested" | "override_changed" | "content_updated" | "deadline_updated";
  payload?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(learningActivityLogs).values(input);
}

export async function createAppNotification(input: {
  userId: number;
  type: "deadline" | "review" | "unlock" | "revision" | "system";
  title: string;
  body: string;
  link?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(appNotifications).values(input);
}

export async function getNotificationsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await db.delete(appNotifications).where(and(eq(appNotifications.userId, userId), isNotNull(appNotifications.readAt), lt(appNotifications.readAt, cutoff)));
  return db.select().from(appNotifications).where(eq(appNotifications.userId, userId)).orderBy(desc(appNotifications.createdAt)).limit(30);
}

export async function deleteExpiredReadNotifications() {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await db.delete(appNotifications).where(and(isNotNull(appNotifications.readAt), lt(appNotifications.readAt, cutoff)));
  return { cutoff: cutoff.toISOString() };
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  await db.update(appNotifications).set({ readAt: new Date() }).where(and(eq(appNotifications.id, notificationId), eq(appNotifications.userId, userId)));
}

function calculateAutoScore(questions: Array<typeof assessmentQuestions.$inferSelect>, answers: Record<string, string | string[]>) {
  let score = 0;
  for (const question of questions) {
    if (question.type === "essay" || !question.correctAnswers) continue;
    const submitted = answers[String(question.id)];
    const submittedValues = Array.isArray(submitted) ? submitted : submitted ? [submitted] : [];
    const expected = [...question.correctAnswers].sort();
    if (submittedValues.sort().join("|") === expected.join("|")) score += question.maxPoints;
  }
  return score;
}

export async function saveAssessmentSubmission(input: {
  studentId: number;
  moduleId: number;
  answers: Record<string, string | string[]>;
  submit: boolean;
}) {
  const module = await getStudentModule(input.studentId, input.moduleId);
  if (!module.assessment) throw new Error("Évaluation introuvable.");
  if (!module.assessment.isOpen) throw new Error("Cette évaluation est actuellement verrouillée par votre formateur.");
  if (module.submission?.status === "reviewed" && !canRequestRetry(module.assessment.allowRetake)) {
    throw new Error("Cette évaluation ne peut plus être soumise après correction.");
  }
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const questions = await db.select().from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, module.assessment.id));
  const autoScore = calculateAutoScore(questions, input.answers);
  const values = {
    studentId: input.studentId,
    moduleId: input.moduleId,
    assessmentId: module.assessment.id,
    answers: input.answers,
    autoScore,
    status: input.submit ? "submitted" as const : "draft" as const,
    submittedAt: input.submit ? new Date() : null,
    isLate: input.submit && isSubmittedLate(module.assessment.dueAt),
  };
  await db.insert(assessmentSubmissions).values(values).onDuplicateKeyUpdate({
    set: {
      answers: values.answers,
      autoScore,
      status: values.status,
      submittedAt: values.submittedAt,
      isLate: values.isLate,
      updatedAt: new Date(),
    },
  });
  if (input.submit) {
    await logLearningActivity({ studentId: input.studentId, moduleId: input.moduleId, action: "assessment_submitted" });
    if (values.isLate) await createAppNotification({ userId: input.studentId, type: "deadline", title: "Évaluation remise après échéance", body: "Votre évaluation a été enregistrée avec un statut de retard. Consultez votre formateur si nécessaire.", link: `module:${input.moduleId}` });
  }
  return { autoScore, status: values.status };
}

export async function createDeliverable(input: {
  studentId: number;
  moduleId: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileKey: string;
  url: string;
}) {
  const module = await getStudentModule(input.studentId, input.moduleId);
  if (!module.assignment) throw new Error("Livrable introuvable.");
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const previous = await db.select({ id: deliverables.id }).from(deliverables).where(and(eq(deliverables.studentId, input.studentId), eq(deliverables.moduleId, input.moduleId))).limit(1);
  if (!canSubmitAnotherVersion(previous.length, module.assignment.allowResubmission)) {
    throw new Error("Le formateur n’autorise pas le dépôt d’une nouvelle version pour ce livrable.");
  }
  await db.insert(deliverables).values({
    studentId: input.studentId,
    moduleId: input.moduleId,
    assignmentId: module.assignment.id,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    fileKey: input.fileKey,
    url: input.url,
    isLate: isSubmittedLate(module.assignment.dueAt),
  });
  await logLearningActivity({ studentId: input.studentId, moduleId: input.moduleId, action: "deliverable_submitted", payload: { fileName: input.fileName } });
  if (isSubmittedLate(module.assignment.dueAt)) await createAppNotification({ userId: input.studentId, type: "deadline", title: "Livrable remis après échéance", body: "Votre livrable a été enregistré avec un statut de retard. Consultez votre formateur si nécessaire.", link: `module:${input.moduleId}` });
}

export async function requestDeliverableRevision(input: { deliverableId: number; note: string; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(deliverables).where(eq(deliverables.id, input.deliverableId)).limit(1);
  const deliverable = existing[0];
  if (!deliverable) throw new Error("Livrable introuvable.");
  const assignment = await db.select().from(assignments).where(eq(assignments.id, deliverable.assignmentId)).limit(1);
  if (!canRequestRetry(Boolean(assignment[0]?.allowResubmission))) throw new Error("Les reprises ne sont pas autorisées pour ce livrable.");
  await db.update(deliverables).set({ returnRequestedAt: new Date(), returnNote: input.note }).where(eq(deliverables.id, input.deliverableId));
  await logLearningActivity({ actorUserId: input.actorUserId, studentId: deliverable.studentId, moduleId: deliverable.moduleId, action: "revision_requested", payload: { deliverableId: deliverable.id, note: input.note } });
  await createAppNotification({ userId: deliverable.studentId, type: "revision", title: "Reprise de livrable demandée", body: input.note || "Votre formateur vous demande de déposer une nouvelle version du livrable.", link: `module:${deliverable.moduleId}` });
}

export async function getReviewQueue() {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const pending = await db.select().from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.status, "submitted"))
    .orderBy(asc(assessmentSubmissions.submittedAt));
  if (pending.length === 0) return [];
  const [students, modules, allAssessments] = await Promise.all([
    db.select().from(users).where(inArray(users.id, pending.map(item => item.studentId))),
    db.select().from(courseModules).where(inArray(courseModules.id, pending.map(item => item.moduleId))),
    db.select().from(assessments).where(inArray(assessments.id, pending.map(item => item.assessmentId))),
  ]);
  return pending.map(submission => ({
    submission,
    student: students.find(item => item.id === submission.studentId),
    module: modules.find(item => item.id === submission.moduleId),
    assessment: allAssessments.find(item => item.id === submission.assessmentId),
  }));
}

export async function getReviewedSubmissions() {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const reviewed = await db.select().from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.status, "reviewed"))
    .orderBy(desc(assessmentSubmissions.reviewedAt));
  if (reviewed.length === 0) return [];
  const [students, modules, allAssessments] = await Promise.all([
    db.select().from(users).where(inArray(users.id, reviewed.map(item => item.studentId))),
    db.select().from(courseModules).where(inArray(courseModules.id, reviewed.map(item => item.moduleId))),
    db.select().from(assessments).where(inArray(assessments.id, reviewed.map(item => item.assessmentId))),
  ]);
  return reviewed.map(submission => ({
    submission,
    student: students.find(item => item.id === submission.studentId),
    module: modules.find(item => item.id === submission.moduleId),
    assessment: allAssessments.find(item => item.id === submission.assessmentId),
  }));
}

export async function getDeliverableReviewQueue() {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const items = await db.select().from(deliverables).orderBy(desc(deliverables.submittedAt)).limit(100);
  if (!items.length) return [];
  const [students, modules] = await Promise.all([
    db.select().from(users).where(inArray(users.id, Array.from(new Set(items.map(item => item.studentId))))),
    db.select().from(courseModules).where(inArray(courseModules.id, Array.from(new Set(items.map(item => item.moduleId))))),
  ]);
  return items.map(item => ({
    ...item,
    student: students.find(student => student.id === item.studentId),
    module: modules.find(module => module.id === item.moduleId),
  }));
}

export async function getDeliverableReviewDetail(deliverableId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const deliverable = (await db.select().from(deliverables).where(eq(deliverables.id, deliverableId)).limit(1))[0];
  if (!deliverable) throw new Error("Livrable introuvable.");
  const [student, module, assignment] = await Promise.all([
    db.select().from(users).where(eq(users.id, deliverable.studentId)).limit(1),
    db.select().from(courseModules).where(eq(courseModules.id, deliverable.moduleId)).limit(1),
    db.select().from(assignments).where(eq(assignments.id, deliverable.assignmentId)).limit(1),
  ]);
  return { deliverable, student: student[0], module: module[0], assignment: assignment[0], fileUrl: await storageGetSignedUrl(deliverable.fileKey) };
}

export async function reviewDeliverable(input: { deliverableId: number; score: number; feedback: string; approved: boolean; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const deliverable = (await db.select().from(deliverables).where(eq(deliverables.id, input.deliverableId)).limit(1))[0];
  if (!deliverable) throw new Error("Livrable introuvable.");
  await db.update(deliverables).set({ manualScore: input.score, feedback: input.feedback, approved: input.approved, reviewedAt: new Date() }).where(eq(deliverables.id, input.deliverableId));
  await logLearningActivity({ actorUserId: input.actorUserId, studentId: deliverable.studentId, moduleId: deliverable.moduleId, action: "deliverable_reviewed", payload: { score: input.score, approved: input.approved } });
  await createAppNotification({ userId: deliverable.studentId, type: input.approved ? "review" : "revision", title: input.approved ? "Livrable corrigé" : "Livrable corrigé : compléments attendus", body: input.approved ? "Votre formateur a corrigé votre livrable. Consultez votre note et son commentaire." : input.feedback || "Votre formateur vous a laissé un retour sur le livrable.", link: `module:${deliverable.moduleId}` });
}

export async function getAssessmentLibrary() {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const [modules, allAssessments, allQuestions] = await Promise.all([
    db.select().from(courseModules).orderBy(asc(courseModules.sequence)),
    db.select().from(assessments),
    db.select().from(assessmentQuestions).orderBy(asc(assessmentQuestions.sequence)),
  ]);
  return modules.map(module => {
    const assessment = allAssessments.find(item => item.moduleId === module.id);
    return { ...module, assessment, questions: assessment ? allQuestions.filter(item => item.assessmentId === assessment.id) : [] };
  });
}

export async function addAssessmentQuestion(input: {
  assessmentId: number;
  type: "single" | "multiple" | "essay";
  prompt: string;
  options?: string[];
  correctAnswers?: string[];
  maxPoints: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select({ sequence: assessmentQuestions.sequence }).from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, input.assessmentId)).orderBy(desc(assessmentQuestions.sequence)).limit(1);
  await db.insert(assessmentQuestions).values({ ...input, sequence: (existing[0]?.sequence ?? 0) + 1 });
}

export async function getAssessmentAnswerKeyDetail(assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
  if (!assessment) throw new Error("Évaluation introuvable.");
  const questions = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, assessmentId)).orderBy(asc(assessmentQuestions.sequence));
  const [answerKey] = await db.select().from(assessmentAnswerKeys).where(eq(assessmentAnswerKeys.assessmentId, assessmentId)).limit(1);
  const reviewedSubmissions = await db.select().from(assessmentSubmissions)
    .where(and(eq(assessmentSubmissions.assessmentId, assessmentId), eq(assessmentSubmissions.status, "reviewed")))
    .orderBy(desc(assessmentSubmissions.reviewedAt));
  const studentIds = reviewedSubmissions.map(item => item.studentId);
  const students = studentIds.length ? await db.select().from(users).where(inArray(users.id, studentIds)) : [];
  const recipients = answerKey
    ? await db.select().from(assessmentAnswerKeyRecipients).where(eq(assessmentAnswerKeyRecipients.answerKeyId, answerKey.id))
    : [];
  return {
    assessment,
    questions,
    answerKey,
    recipients: recipients.map(item => item.studentId),
    candidates: reviewedSubmissions.map(submission => ({
      submissionId: submission.id,
      student: students.find(item => item.id === submission.studentId),
      score: submission.manualScore,
      reviewedAt: submission.reviewedAt,
    })),
  };
}

export async function saveAssessmentAnswerKey(input: { assessmentId: number; content: string; actorUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const content = input.content.trim();
  if (!content) throw new Error("Le corrigé type ne peut pas être vide.");
  await db.insert(assessmentAnswerKeys).values({ assessmentId: input.assessmentId, content, updatedBy: input.actorUserId }).onDuplicateKeyUpdate({
    set: { content, updatedBy: input.actorUserId, updatedAt: new Date() },
  });
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: assessment?.moduleId, action: "content_updated", payload: { content: "assessment_answer_key" } });
}

export async function sendAssessmentAnswerKey(input: { assessmentId: number; studentIds: number[]; actorUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const [answerKey] = await db.select().from(assessmentAnswerKeys).where(eq(assessmentAnswerKeys.assessmentId, input.assessmentId)).limit(1);
  if (!answerKey) throw new Error("Enregistrez d’abord le corrigé type avant de l’envoyer.");
  const uniqueStudentIds = Array.from(new Set(input.studentIds));
  const reviewed = uniqueStudentIds.length
    ? await db.select().from(assessmentSubmissions).where(and(eq(assessmentSubmissions.assessmentId, input.assessmentId), eq(assessmentSubmissions.status, "reviewed"), inArray(assessmentSubmissions.studentId, uniqueStudentIds)))
    : [];
  if (reviewed.length !== uniqueStudentIds.length) throw new Error("Sélectionnez uniquement des apprenants dont l’évaluation a été corrigée.");
  await db.delete(assessmentAnswerKeyRecipients).where(eq(assessmentAnswerKeyRecipients.answerKeyId, answerKey.id));
  await db.insert(assessmentAnswerKeyRecipients).values(uniqueStudentIds.map(studentId => ({ answerKeyId: answerKey.id, studentId, sentBy: input.actorUserId })));
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
  const title = assessment?.title || "votre évaluation";
  await Promise.all(uniqueStudentIds.map(userId => createAppNotification({ userId, type: "system", title: "Corrigé type disponible", body: `Votre formateur vous a partagé le corrigé type de « ${title} ».`, link: assessment?.moduleId ? `module:${assessment.moduleId}` : "/" })));
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: assessment?.moduleId, action: "content_updated", payload: { content: "assessment_answer_key_sent", recipients: uniqueStudentIds.length } });
}

export async function getContentLibrary() {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const [modules, allLessons, allAssignments, allAssessments, allResources, allQuestions, allRubrics, allCriteria] = await Promise.all([
    db.select().from(courseModules).orderBy(asc(courseModules.sequence)),
    db.select().from(lessons).orderBy(asc(lessons.sequence)),
    db.select().from(assignments),
    db.select().from(assessments),
    db.select().from(learningResources).orderBy(asc(learningResources.sequence)),
    db.select().from(assessmentQuestions).orderBy(asc(assessmentQuestions.sequence)),
    db.select().from(rubrics),
    db.select().from(rubricCriteria).orderBy(asc(rubricCriteria.sequence)),
  ]);
  return modules.map(module => {
    const assessment = allAssessments.find(item => item.moduleId === module.id);
    const rubric = assessment ? allRubrics.find(item => item.assessmentId === assessment.id) : undefined;
    return {
      ...module,
      lessons: allLessons.filter(item => item.moduleId === module.id),
      assignment: allAssignments.find(item => item.moduleId === module.id),
      assessment,
      questions: assessment ? allQuestions.filter(item => item.assessmentId === assessment.id) : [],
      resources: allResources.filter(item => item.moduleId === module.id),
      rubric: rubric ? { ...rubric, criteria: allCriteria.filter(item => item.rubricId === rubric.id) } : undefined,
    };
  });
}

export async function createModule(input: { code: string; sequence: number; title: string; summary: string; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  await db.insert(courseModules).values({ code: input.code, sequence: input.sequence, title: input.title, summary: input.summary });
  await logLearningActivity({ actorUserId: input.actorUserId, action: "content_updated", payload: { content: "module_created", code: input.code } });
}

export async function updateModuleContent(input: { id: number; title: string; summary: string; sequence: number; isPublished: boolean; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  if (!canPublishContent(input.title, input.summary, input.sequence)) throw new Error("Les informations du module sont incomplètes ou invalides.");
  const previous = await db.select().from(courseModules).where(eq(courseModules.id, input.id)).limit(1);
  await db.update(courseModules).set({ title: input.title, summary: input.summary, sequence: input.sequence, isPublished: input.isPublished }).where(eq(courseModules.id, input.id));
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: input.id, action: "content_updated", payload: { content: "module" } });
  if (input.isPublished && previous[0] && !previous[0].isPublished) {
    const activeUsers = await db.select().from(enrollments).where(eq(enrollments.status, "active"));
    if (activeUsers.length > 0) await db.insert(appNotifications).values(activeUsers.map(item => ({ userId: item.userId, type: "system" as const, title: "Nouveau contenu disponible", body: `Le module « ${input.title} » est maintenant disponible dans votre parcours.`, link: "/" })));
  }
}

export async function upsertLesson(input: { id?: number; moduleId: number; sequence: number; title: string; duration: string; summary: string; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  if (input.id) await db.update(lessons).set({ sequence: input.sequence, title: input.title, duration: input.duration, summary: input.summary }).where(eq(lessons.id, input.id));
  else await db.insert(lessons).values({ moduleId: input.moduleId, sequence: input.sequence, title: input.title, duration: input.duration, summary: input.summary });
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: input.moduleId, action: "content_updated", payload: { content: "lesson" } });
}

export async function updateAssignmentContent(input: { moduleId: number; title: string; instructions: string; expectedFormat: string; dueAt?: Date | null; allowResubmission: boolean; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  await db.update(assignments).set({ title: input.title, instructions: input.instructions, expectedFormat: input.expectedFormat, dueAt: input.dueAt ?? null, allowResubmission: input.allowResubmission }).where(eq(assignments.moduleId, input.moduleId));
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: input.moduleId, action: "deadline_updated", payload: { content: "assignment" } });
}

export async function updateAssessmentContent(input: { id: number; title: string; instructions: string; dueAt?: Date | null; allowRetake: boolean; isOpen: boolean; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(assessments).where(eq(assessments.id, input.id)).limit(1);
  await db.update(assessments).set({ title: input.title, instructions: input.instructions, dueAt: input.dueAt ?? null, allowRetake: input.allowRetake, isOpen: input.isOpen }).where(eq(assessments.id, input.id));
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: existing[0]?.moduleId, action: "deadline_updated", payload: { content: "assessment" } });
  if (input.isOpen && !existing[0]?.isOpen && existing[0]?.moduleId) {
    const [module] = await db.select().from(courseModules).where(eq(courseModules.id, existing[0].moduleId)).limit(1);
    const recipients = module ? await db.select().from(enrollments).where(and(eq(enrollments.status, "active"), eq(enrollments.cohort, module.cohort))) : [];
    if (recipients.length) await db.insert(appNotifications).values(recipients.map(item => ({ userId: item.userId, type: "unlock" as const, title: "Évaluation ouverte", body: `Votre formateur vous autorise maintenant à composer « ${input.title} ».`, link: `module:${existing[0]!.moduleId}` })));
  }
}

export async function addLearningResource(input: { moduleId: number; title: string; description?: string; type: "link" | "note"; url?: string; content?: string; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const latest = await db.select({ sequence: learningResources.sequence }).from(learningResources).where(eq(learningResources.moduleId, input.moduleId)).orderBy(desc(learningResources.sequence)).limit(1);
  await db.insert(learningResources).values({ ...input, sequence: (latest[0]?.sequence ?? 0) + 1 });
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: input.moduleId, action: "content_updated", payload: { content: "resource" } });
}

export async function saveRubric(input: { assessmentId: number; title: string; description?: string; criteria: Array<{ label: string; description?: string; maxPoints: number }>; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  await db.insert(rubrics).values({ assessmentId: input.assessmentId, title: input.title, description: input.description }).onDuplicateKeyUpdate({ set: { title: input.title, description: input.description ?? null, updatedAt: new Date() } });
  const rubric = await db.select().from(rubrics).where(eq(rubrics.assessmentId, input.assessmentId)).limit(1);
  if (!rubric[0]) throw new Error("Barème introuvable.");
  await db.delete(rubricCriteria).where(eq(rubricCriteria.rubricId, rubric[0].id));
  if (input.criteria.length > 0) await db.insert(rubricCriteria).values(input.criteria.map((criterion, index) => ({ rubricId: rubric[0]!.id, sequence: index + 1, ...criterion })));
  const assessment = await db.select().from(assessments).where(eq(assessments.id, input.assessmentId)).limit(1);
  await logLearningActivity({ actorUserId: input.actorUserId, moduleId: assessment[0]?.moduleId, action: "content_updated", payload: { content: "rubric" } });
}

export async function copyRubric(input: { sourceAssessmentId: number; targetAssessmentId: number; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  if (!canCopyRubric(input.sourceAssessmentId, input.targetAssessmentId)) throw new Error("Choisissez un barème source différent de l’évaluation cible.");
  const source = await db.select().from(rubrics).where(eq(rubrics.assessmentId, input.sourceAssessmentId)).limit(1);
  if (!source[0]) throw new Error("Le barème source est introuvable.");
  const criteria = await db.select().from(rubricCriteria).where(eq(rubricCriteria.rubricId, source[0].id)).orderBy(asc(rubricCriteria.sequence));
  await saveRubric({
    assessmentId: input.targetAssessmentId,
    title: source[0].title,
    description: source[0].description ?? undefined,
    criteria: criteria.map(item => ({ label: item.label, description: item.description ?? undefined, maxPoints: item.maxPoints })),
    actorUserId: input.actorUserId,
  });
}

export async function getSubmissionForReview(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const result = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, submissionId)).limit(1);
  const submission = result[0];
  if (!submission) throw new Error("Soumission introuvable.");
  const [student, module, assessment] = await Promise.all([
    db.select().from(users).where(eq(users.id, submission.studentId)).limit(1),
    db.select().from(courseModules).where(eq(courseModules.id, submission.moduleId)).limit(1),
    db.select().from(assessments).where(eq(assessments.id, submission.assessmentId)).limit(1),
  ]);
  const questions = await db.select().from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, submission.assessmentId)).orderBy(asc(assessmentQuestions.sequence));
  return { submission, student: student[0], module: module[0], assessment: assessment[0], questions };
}

export async function reviewSubmission(input: {
  submissionId: number;
  score: number;
  feedback: string;
  approved: boolean;
  actorUserId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, input.submissionId)).limit(1);
  await db.update(assessmentSubmissions).set({
    manualScore: input.score,
    feedback: input.feedback,
    approved: input.approved,
    status: "reviewed",
    reviewedAt: new Date(),
  }).where(eq(assessmentSubmissions.id, input.submissionId));
  const submission = existing[0];
  if (submission) {
    const isRectification = submission.status === "reviewed";
    await logLearningActivity({ actorUserId: input.actorUserId, studentId: submission.studentId, moduleId: submission.moduleId, action: "assessment_reviewed", payload: { score: input.score, approved: input.approved, rectification: isRectification } });
    await createAppNotification({ userId: submission.studentId, type: isRectification ? "review" : input.approved ? "unlock" : "review", title: isRectification ? "Correction actualisée" : input.approved ? "Évaluation validée" : "Évaluation corrigée", body: isRectification ? "Votre formateur a rectifié votre note ou son commentaire. Consultez votre résultat mis à jour." : input.approved ? "Votre évaluation a été validée. Le module suivant est désormais accessible." : "Votre évaluation a été corrigée. Consultez les commentaires de votre formateur.", link: `module:${submission.moduleId}` });
  }
}

export async function requestRevision(input: { submissionId: number; note: string; actorUserId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, input.submissionId)).limit(1);
  const submission = existing[0];
  if (!submission) throw new Error("Soumission introuvable.");
  const assessment = await db.select().from(assessments).where(eq(assessments.id, submission.assessmentId)).limit(1);
  if (!canRequestRetry(Boolean(assessment[0]?.allowRetake))) throw new Error("Les reprises ne sont pas autorisées pour cette évaluation.");
  await db.update(assessmentSubmissions).set({ status: "draft", approved: false, returnRequestedAt: new Date(), returnNote: input.note, attempt: submission.attempt + 1, updatedAt: new Date() }).where(eq(assessmentSubmissions.id, input.submissionId));
  await logLearningActivity({ actorUserId: input.actorUserId, studentId: submission.studentId, moduleId: submission.moduleId, action: "revision_requested", payload: { note: input.note } });
  await createAppNotification({ userId: submission.studentId, type: "revision", title: "Reprise demandée", body: input.note || "Votre formateur vous demande d’améliorer puis de soumettre une nouvelle version.", link: `module:${submission.moduleId}` });
}

export async function setStudentOverride(input: { studentId: number; moduleId: number; state: "locked" | "unlocked"; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  await db.insert(progressOverrides).values(input).onDuplicateKeyUpdate({
    set: { state: input.state, note: input.note ?? null, updatedAt: new Date() },
  });
  await logLearningActivity({ studentId: input.studentId, moduleId: input.moduleId, action: "override_changed", payload: { state: input.state } });
}

export async function getStudentOverview() {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const students = await db.select().from(users).where(eq(users.role, "user")).orderBy(asc(users.name));
  const studentIds = students.map(student => student.id);
  const activeEnrollments = studentIds.length > 0
    ? await db.select().from(enrollments).where(inArray(enrollments.userId, studentIds))
    : [];
  return Promise.all(students.map(async student => {
    const modules = await getProgramForStudent(student.id, false);
    const completed = modules.filter(module => module.submission?.status === "reviewed" && module.submission.approved).length;
    const waiting = modules.filter(module => module.submission?.status === "submitted").length;
    const moduleScores = modules.map(module => ({
      moduleId: module.id,
      code: module.code,
      title: module.title,
      sequence: module.sequence,
      score: module.submission?.status === "reviewed" ? module.submission.manualScore : null,
    }));
    const gradedScores = moduleScores.flatMap(module => module.score === null ? [] : [module.score]);
    const averageScore = gradedScores.length
      ? Number((gradedScores.reduce((sum, score) => sum + score, 0) / gradedScores.length).toFixed(1))
      : null;
    return {
      student,
      enrollment: activeEnrollments.find(item => item.userId === student.id),
      completed,
      waiting,
      total: modules.length,
      modules,
      moduleScores,
      averageScore,
    };
  }));
}

export async function getStudentEnrollment(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const rows = await db.select().from(enrollments).where(eq(enrollments.userId, userId)).limit(1);
  return rows[0];
}

export async function requestStudentEnrollment(input: { userId: number; cohort: "Gestion des médias sociaux" | "Business digital"; intake: IntakeName }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(enrollments).where(eq(enrollments.userId, input.userId)).limit(1);
  if (existing[0]?.status === "active") throw new Error("Votre inscription est déjà validée par le formateur.");
  await db.insert(enrollments).values({ userId: input.userId, status: "suspended", cohort: input.cohort, intake: input.intake }).onDuplicateKeyUpdate({
    set: { cohort: input.cohort, intake: input.intake, updatedAt: new Date() },
  });
  return getStudentEnrollment(input.userId);
}

export async function setStudentEnrollment(input: { userId: number; status: "active" | "suspended"; cohort?: "Gestion des médias sociaux" | "Business digital"; intake?: IntakeName }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(enrollments).where(eq(enrollments.userId, input.userId)).limit(1);
  const assignedCohort = input.cohort ?? existing[0]?.cohort;
  const intake = input.intake ?? (existing[0]?.intake as IntakeName | undefined) ?? INTAKE_ONE;
  if (input.status === "active" && !assignedCohort) throw new Error("Choisissez d’abord une filière avant d’autoriser cet élève.");
  const cohort = assignedCohort ?? "Gestion des médias sociaux";
  await db.insert(enrollments).values({ userId: input.userId, status: input.status, cohort, intake }).onDuplicateKeyUpdate({
    set: { status: input.status, cohort, intake, updatedAt: new Date() },
  });
}

export async function getStudentHistory(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  return db.select().from(learningActivityLogs).where(eq(learningActivityLogs.studentId, studentId)).orderBy(desc(learningActivityLogs.createdAt)).limit(80);
}

export async function getCohortAnalytics(cohort?: "Gestion des médias sociaux" | "Business digital") {
  await ensureCurriculum();
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const modules = cohort ? await db.select().from(courseModules).where(eq(courseModules.cohort, cohort)) : await db.select().from(courseModules);
  const moduleIds = modules.map(module => module.id);
  const moduleAssessments = moduleIds.length ? await db.select().from(assessments).where(inArray(assessments.moduleId, moduleIds)) : [];
  const assessmentIds = moduleAssessments.map(assessment => assessment.id);
  const [submissions, questions, allDeliverables] = await Promise.all([
    moduleIds.length ? db.select().from(assessmentSubmissions).where(inArray(assessmentSubmissions.moduleId, moduleIds)) : [],
    assessmentIds.length ? db.select().from(assessmentQuestions).where(inArray(assessmentQuestions.assessmentId, assessmentIds)) : [],
    moduleIds.length ? db.select().from(deliverables).where(inArray(deliverables.moduleId, moduleIds)) : [],
  ]);
  const reviewed = submissions.filter(item => item.status === "reviewed" && item.manualScore !== null);
  const average = reviewed.length ? reviewed.reduce((sum, item) => sum + (item.manualScore ?? 0), 0) / reviewed.length : 0;
  const autoResults = questions.map(question => {
    const answered = submissions.filter(submission => submission.answers[String(question.id)] !== undefined);
    const correct = answered.filter(submission => {
      const value = submission.answers[String(question.id)];
      const selected = Array.isArray(value) ? value : value ? [value] : [];
      return question.correctAnswers && selected.sort().join("|") === [...question.correctAnswers].sort().join("|");
    }).length;
    return { question, responseCount: answered.length, successRate: answered.length ? Math.round((correct / answered.length) * 100) : null };
  }).filter(item => item.question.type !== "essay").sort((a, b) => (a.successRate ?? 101) - (b.successRate ?? 101)).slice(0, 5);
  return { average: Number(average.toFixed(1)), submitted: submissions.filter(item => item.status === "submitted").length, returned: submissions.filter(item => item.returnRequestedAt !== null).length, overdue: submissions.filter(item => item.isLate).length + allDeliverables.filter(item => item.isLate).length, difficultQuestions: autoResults };
}

export async function getQuestionInsights(questionId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const question = (await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.id, questionId)).limit(1))[0];
  if (!question) throw new Error("Question introuvable.");
  const assessment = (await db.select().from(assessments).where(eq(assessments.id, question.assessmentId)).limit(1))[0];
  if (!assessment) throw new Error("Évaluation introuvable.");
  const [module, submissions] = await Promise.all([
    db.select().from(courseModules).where(eq(courseModules.id, assessment.moduleId)).limit(1),
    db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.assessmentId, assessment.id)),
  ]);
  const answered = submissions.filter(submission => submission.answers[String(question.id)] !== undefined);
  const studentIds = Array.from(new Set(answered.map(submission => submission.studentId)));
  const students = studentIds.length ? await db.select().from(users).where(inArray(users.id, studentIds)) : [];
  return {
    question,
    assessment,
    module: module[0],
    responses: answered.map(submission => {
      const answer = submission.answers[String(question.id)];
      const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
      const correct = Boolean(question.correctAnswers) && selected.sort().join("|") === [...(question.correctAnswers ?? [])].sort().join("|");
      return { student: students.find(student => student.id === submission.studentId), answer, correct, submittedAt: submission.submittedAt, status: submission.status };
    }),
  };
}

export function formatCohortCsv(overview: Array<{ student: { name: string | null; email: string | null }; enrollment?: { status: string; cohort?: string } | undefined; completed: number; total: number; waiting: number; averageScore?: number | null; moduleScores?: Array<{ code: string; score: number | null }> }>) {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const moduleCodes = Array.from(new Set(overview.flatMap(item => item.moduleScores?.map(module => module.code) ?? [])));
  const rows = [["Élève", "Email", "Filière", "Accès", "Modules validés", "Total modules", "À corriger", "Moyenne générale /20", ...moduleCodes.map(code => `Note ${code} /20`)].map(escape).join(";")];
  for (const item of overview) {
    const scoresByCode = new Map((item.moduleScores ?? []).map(module => [module.code, module.score]));
    rows.push([
      item.student.name ?? "",
      item.student.email ?? "",
      item.enrollment?.cohort ?? "",
      item.enrollment?.status ?? "en attente",
      item.completed,
      item.total,
      item.waiting,
      item.averageScore ?? "",
      ...moduleCodes.map(code => scoresByCode.get(code) ?? ""),
    ].map(escape).join(";"));
  }
  return rows.join("\n");
}

export async function getCohortCsv(cohort?: "Gestion des médias sociaux" | "Business digital") {
  const overview = await getStudentOverview();
  return formatCohortCsv(cohort ? overview.filter(item => item.enrollment?.cohort === cohort) : overview);
}


const INITIAL_SIMULATION_METRICS = { budget: 500000, visibility: 18, engagement: 12, prospects: 0, satisfaction: 60 };

async function notifySimulationSubmitted(reason: "completed" | "expired") {
  const db = await getDb();
  if (!db) return;
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  if (admin) await createAppNotification({ userId: admin.id, type: "system", title: reason === "expired" ? "Simulation envoyée à la fin du temps" : "Simulation formative remise", body: reason === "expired" ? "Le temps est écoulé : le parcours de décisions d’un apprenant Business digital a été verrouillé et transmis." : "Un apprenant Business digital a terminé la mission Naya Conseil. Consultez son parcours de décisions.", link: "simulations" });
}

export async function ensureFormativeSimulation() {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = await db.select().from(formativeSimulations).where(eq(formativeSimulations.code, FORMATIVE_SIMULATION_CODE)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(formativeSimulations).values({ code: FORMATIVE_SIMULATION_CODE, cohort: "Business digital", title: "Mission Naya Conseil — Pilotage d’une campagne digitale", description: "Une simulation pratique approfondie en 16 décisions et quatre phases : diagnostic, conception, optimisation et recommandation finale. Les données et conséquences évoluent après chaque choix.", durationSeconds: FORMATIVE_SIMULATION_DURATION_SECONDS, isPublished: true });
  const simulation = await db.select().from(formativeSimulations).where(eq(formativeSimulations.code, FORMATIVE_SIMULATION_CODE)).limit(1);
  const simulationId = simulation[0]?.id;
  if (!simulationId) throw new Error("La simulation n’a pas pu être initialisée.");
  for (const step of nayaSimulationSteps) {
    await db.insert(formativeSimulationSteps).values({ simulationId, code: step.id, sequence: step.sequence, title: step.title, context: step.context, objective: step.objective, imageKey: step.imageKey });
    const rows = await db.select().from(formativeSimulationSteps).where(and(eq(formativeSimulationSteps.simulationId, simulationId), eq(formativeSimulationSteps.code, step.id))).limit(1);
    const stepId = rows[0]?.id;
    if (!stepId) throw new Error("Une étape de simulation n’a pas pu être initialisée.");
    await db.insert(formativeSimulationChoices).values(step.choices.map(choice => ({ stepId, code: choice.id, label: choice.label, consequence: choice.consequence, feedback: choice.feedback, score: choice.score, metrics: choice.metrics })));
  }
  return simulation[0];
}

async function expireSimulationIfNeeded(attempt: typeof formativeSimulationAttempts.$inferSelect) {
  if (!attempt.startedAt || attempt.status !== "draft") return attempt;
  const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
  if (elapsed < FORMATIVE_SIMULATION_DURATION_SECONDS) return attempt;
  const db = await getDb();
  if (!db) return attempt;
  await db.update(formativeSimulationAttempts).set({ status: "expired", submittedAt: new Date(), lastSavedAt: new Date() }).where(eq(formativeSimulationAttempts.id, attempt.id));
  await notifySimulationSubmitted("expired");
  return { ...attempt, status: "expired" as const, submittedAt: new Date(), lastSavedAt: new Date() };
}

function simulationRemainingSeconds(attempt: typeof formativeSimulationAttempts.$inferSelect, durationSeconds: number) {
  if (!attempt.startedAt || attempt.status !== "draft") return 0;
  return Math.max(0, durationSeconds - Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000));
}

async function loadSimulationBundle(simulationId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const [simulation] = await db.select().from(formativeSimulations).where(eq(formativeSimulations.id, simulationId)).limit(1);
  if (!simulation) throw new Error("Simulation introuvable.");
  const steps = await db.select().from(formativeSimulationSteps).where(eq(formativeSimulationSteps.simulationId, simulationId)).orderBy(asc(formativeSimulationSteps.sequence));
  const choices = steps.length ? await db.select().from(formativeSimulationChoices).where(inArray(formativeSimulationChoices.stepId, steps.map(step => step.id))) : [];
  return { simulation, steps: steps.map(step => ({ ...step, choices: choices.filter(choice => choice.stepId === step.id) })) };
}

export async function getFormativeSimulationForStudent(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const enrollment = await db.select().from(enrollments).where(eq(enrollments.userId, studentId)).limit(1);
  if (!enrollment[0] || enrollment[0].status !== "active" || enrollment[0].cohort !== "Business digital") throw new Error("Cette simulation est réservée aux apprenants autorisés de la filière Business digital.");
  const simulation = await ensureFormativeSimulation();
  const bundle = await loadSimulationBundle(simulation.id);
  let [attempt] = await db.select().from(formativeSimulationAttempts).where(and(eq(formativeSimulationAttempts.simulationId, simulation.id), eq(formativeSimulationAttempts.studentId, studentId))).limit(1);
  if (attempt) attempt = await expireSimulationIfNeeded(attempt);
  return { ...bundle, attempt, remainingSeconds: attempt ? simulationRemainingSeconds(attempt, bundle.simulation.durationSeconds) : bundle.simulation.durationSeconds };
}

export async function startFormativeSimulation(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const data = await getFormativeSimulationForStudent(studentId);
  if (data.attempt?.status === "submitted" || data.attempt?.status === "expired") return data;
  if (!data.attempt) await db.insert(formativeSimulationAttempts).values({ simulationId: data.simulation.id, studentId, status: "draft", startedAt: new Date(), currentStep: 0, score: 0, responses: {}, metrics: INITIAL_SIMULATION_METRICS });
  else if (!data.attempt.startedAt) await db.update(formativeSimulationAttempts).set({ startedAt: new Date(), lastSavedAt: new Date() }).where(eq(formativeSimulationAttempts.id, data.attempt.id));
  return getFormativeSimulationForStudent(studentId);
}

export async function saveFormativeDecision(input: { studentId: number; stepCode: string; choiceCode: string }) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  let data = await getFormativeSimulationForStudent(input.studentId);
  if (!data.attempt) {
    await db.insert(formativeSimulationAttempts).values({ simulationId: data.simulation.id, studentId: input.studentId, status: "draft", startedAt: new Date(), currentStep: 0, score: 0, responses: {}, metrics: INITIAL_SIMULATION_METRICS });
    data = await getFormativeSimulationForStudent(input.studentId);
  }
  if (!data.attempt || data.attempt.status !== "draft") throw new Error("Cette simulation est déjà terminée.");
  if (!data.attempt.startedAt) throw new Error("Démarrez la simulation avant de choisir une décision.");
  if (data.remainingSeconds <= 0) {
    await db.update(formativeSimulationAttempts).set({ status: "expired", submittedAt: new Date(), lastSavedAt: new Date() }).where(eq(formativeSimulationAttempts.id, data.attempt.id));
    return getFormativeSimulationForStudent(input.studentId);
  }
  const step = data.steps.find(item => item.code === input.stepCode);
  if (!step || step.sequence !== data.attempt.currentStep + 1) throw new Error("Cette étape n’est pas celle attendue.");
  const choice = step.choices.find(item => item.code === input.choiceCode);
  if (!choice) throw new Error("Décision introuvable.");
  const previousMetrics = data.attempt.metrics || INITIAL_SIMULATION_METRICS;
  const nextMetrics = { budget: Math.max(0, previousMetrics.budget + choice.metrics.budget), visibility: Math.max(0, previousMetrics.visibility + choice.metrics.visibility), engagement: Math.max(0, previousMetrics.engagement + choice.metrics.engagement), prospects: Math.max(0, previousMetrics.prospects + choice.metrics.prospects), satisfaction: Math.max(0, Math.min(100, previousMetrics.satisfaction + choice.metrics.satisfaction)) };
  const responses = { ...(data.attempt.responses || {}), [step.code]: { choiceId: choice.code, score: choice.score, consequence: choice.consequence, feedback: choice.feedback, at: new Date().toISOString() } };
  const isFinal = step.sequence >= data.steps.length;
  await db.update(formativeSimulationAttempts).set({ responses, metrics: nextMetrics, score: data.attempt.score + choice.score, currentStep: step.sequence, status: isFinal ? "submitted" : "draft", submittedAt: isFinal ? new Date() : null, lastSavedAt: new Date() }).where(eq(formativeSimulationAttempts.id, data.attempt.id));
  if (isFinal) {
    await notifySimulationSubmitted("completed");
  }
  return getFormativeSimulationForStudent(input.studentId);
}

export async function finalizeFormativeSimulation(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const data = await getFormativeSimulationForStudent(studentId);
  if (data.attempt?.status === "draft" && data.remainingSeconds <= 0 && data.attempt.id) {
    await db.update(formativeSimulationAttempts).set({ status: "expired", submittedAt: new Date(), lastSavedAt: new Date() }).where(eq(formativeSimulationAttempts.id, data.attempt.id));
    await notifySimulationSubmitted("expired");
  }
  return getFormativeSimulationForStudent(studentId);
}

export async function getFormativeSimulationAdminOverview() {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const simulation = await ensureFormativeSimulation();
  const bundle = await loadSimulationBundle(simulation.id);
  const attempts = await db.select().from(formativeSimulationAttempts).where(eq(formativeSimulationAttempts.simulationId, simulation.id)).orderBy(desc(formativeSimulationAttempts.lastSavedAt));
  const students = attempts.length ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, attempts.map(item => item.studentId))) : [];
  return { simulation: bundle.simulation, steps: bundle.steps, attempts: attempts.map(attempt => ({ ...attempt, student: students.find(student => student.id === attempt.studentId), remainingSeconds: simulationRemainingSeconds(attempt, bundle.simulation.durationSeconds) })) };
}
