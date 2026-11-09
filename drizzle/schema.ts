import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  age: int("age"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  status: mysqlEnum("enrollmentStatus", ["active", "suspended"]).notNull().default("active"),
  cohort: varchar("cohort", { length: 80 }).notNull().default("Gestion des médias sociaux"),
  intake: varchar("intake", { length: 80 }).notNull().default("Rentrée 1 — Septembre 2026"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("enrollments_intake_idx").on(table.intake)]);

export const courseModules = mysqlTable("course_modules", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  cohort: varchar("cohort", { length: 80 }).notNull().default("Gestion des médias sociaux"),
  sequence: int("sequence").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  isPublished: boolean("isPublished").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("cohort_module_sequence_unique").on(table.cohort, table.sequence)]);

export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  sequence: int("sequence").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 32 }).notNull(),
  summary: text("summary").notNull(),
}, table => [index("lessons_module_idx").on(table.moduleId)]);

export const assignments = mysqlTable("assignments", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  instructions: text("instructions").notNull(),
  expectedFormat: text("expectedFormat").notNull(),
  dueAt: timestamp("dueAt"),
  allowResubmission: boolean("allowResubmission").notNull().default(true),
});

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  instructions: text("instructions").notNull(),
  maxScore: int("maxScore").notNull().default(20),
  dueAt: timestamp("dueAt"),
  allowRetake: boolean("allowRetake").notNull().default(true),
  isOpen: boolean("isOpen").notNull().default(false),
});

export const assessmentAnswerKeys = mysqlTable("assessment_answer_keys", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull().unique(),
  content: text("content").notNull(),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentAnswerKeyRecipients = mysqlTable("assessment_answer_key_recipients", {
  id: int("id").autoincrement().primaryKey(),
  answerKeyId: int("answerKeyId").notNull(),
  studentId: int("studentId").notNull(),
  sentBy: int("sentBy"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("answer_key_recipient_unique").on(table.answerKeyId, table.studentId),
  index("answer_key_recipient_student_idx").on(table.studentId),
]);

export const assessmentQuestions = mysqlTable("assessment_questions", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  sequence: int("sequence").notNull(),
  type: mysqlEnum("questionType", ["single", "multiple", "essay"]).notNull(),
  prompt: text("prompt").notNull(),
  options: json("options").$type<string[]>(),
  correctAnswers: json("correctAnswers").$type<string[]>(),
  maxPoints: int("maxPoints").notNull(),
}, table => [index("questions_assessment_idx").on(table.assessmentId)]);

export const assessmentSubmissions = mysqlTable("assessment_submissions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  moduleId: int("moduleId").notNull(),
  assessmentId: int("assessmentId").notNull(),
  answers: json("answers").$type<Record<string, string | string[]>>().notNull(),
  autoScore: int("autoScore"),
  manualScore: int("manualScore"),
  feedback: text("feedback"),
  aiSuggestion: json("aiSuggestion").$type<{ score: number; feedback: string; confidence: number }>(),
  status: mysqlEnum("submissionStatus", ["draft", "submitted", "reviewed"]).notNull().default("draft"),
  approved: boolean("approved").notNull().default(false),
  attempt: int("attempt").notNull().default(1),
  returnRequestedAt: timestamp("returnRequestedAt"),
  returnNote: text("returnNote"),
  isLate: boolean("isLate").notNull().default(false),
  submittedAt: timestamp("submittedAt"),
  reviewedAt: timestamp("reviewedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("student_assessment_unique").on(table.studentId, table.assessmentId),
  index("submissions_student_idx").on(table.studentId),
  index("submissions_status_idx").on(table.status),
]);

export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  moduleId: int("moduleId").notNull(),
  assignmentId: int("assignmentId").notNull(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileSize: int("fileSize").notNull(),
  fileKey: varchar("fileKey", { length: 768 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  isLate: boolean("isLate").notNull().default(false),
  returnRequestedAt: timestamp("returnRequestedAt"),
  returnNote: text("returnNote"),
  manualScore: int("manualScore"),
  feedback: text("feedback"),
  approved: boolean("approved").notNull().default(false),
  reviewedAt: timestamp("reviewedAt"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
}, table => [index("deliverables_student_module_idx").on(table.studentId, table.moduleId)]);

export const progressOverrides = mysqlTable("progress_overrides", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  moduleId: int("moduleId").notNull(),
  state: mysqlEnum("progressOverrideState", ["locked", "unlocked"]).notNull(),
  note: text("note"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("student_module_override_unique").on(table.studentId, table.moduleId)]);

export const learningResources = mysqlTable("learning_resources", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  sequence: int("sequence").notNull(),
  type: mysqlEnum("resourceType", ["link", "note"]).notNull().default("link"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 1024 }),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("resources_module_idx").on(table.moduleId)]);

export const rubrics = mysqlTable("rubrics", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const rubricCriteria = mysqlTable("rubric_criteria", {
  id: int("id").autoincrement().primaryKey(),
  rubricId: int("rubricId").notNull(),
  sequence: int("sequence").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  maxPoints: int("maxPoints").notNull(),
}, table => [index("criteria_rubric_idx").on(table.rubricId)]);

export const formativeSimulations = mysqlTable("formative_simulations", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  cohort: varchar("cohort", { length: 80 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  durationSeconds: int("durationSeconds").notNull().default(7200),
  isPublished: boolean("isPublished").notNull().default(true),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("simulation_schedule_idx").on(table.scheduleCronTaskUid)]);

export const formativeSimulationSteps = mysqlTable("formative_simulation_steps", {
  id: int("id").autoincrement().primaryKey(),
  simulationId: int("simulationId").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  sequence: int("sequence").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  context: text("context").notNull(),
  objective: text("objective").notNull(),
  imageKey: varchar("imageKey", { length: 32 }).notNull(),
}, table => [index("simulation_steps_simulation_idx").on(table.simulationId), uniqueIndex("simulation_step_unique").on(table.simulationId, table.code)]);

export const formativeSimulationChoices = mysqlTable("formative_simulation_choices", {
  id: int("id").autoincrement().primaryKey(),
  stepId: int("stepId").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  label: text("label").notNull(),
  consequence: text("consequence").notNull(),
  feedback: text("feedback").notNull(),
  score: int("score").notNull().default(0),
  metrics: json("metrics").$type<{ budget: number; visibility: number; engagement: number; prospects: number; satisfaction: number }>().notNull(),
}, table => [index("simulation_choices_step_idx").on(table.stepId), uniqueIndex("simulation_choice_unique").on(table.stepId, table.code)]);

export const formativeSimulationAttempts = mysqlTable("formative_simulation_attempts", {
  id: int("id").autoincrement().primaryKey(),
  simulationId: int("simulationId").notNull(),
  studentId: int("studentId").notNull(),
  status: mysqlEnum("simulationAttemptStatus", ["draft", "submitted", "expired"]).notNull().default("draft"),
  startedAt: timestamp("startedAt"),
  submittedAt: timestamp("submittedAt"),
  lastSavedAt: timestamp("lastSavedAt").defaultNow().onUpdateNow().notNull(),
  currentStep: int("currentStep").notNull().default(0),
  score: int("score").notNull().default(0),
  responses: json("responses").$type<Record<string, unknown>>().notNull(),
  metrics: json("metrics").$type<{ budget: number; visibility: number; engagement: number; prospects: number; satisfaction: number }>().notNull(),
}, table => [uniqueIndex("simulation_attempt_student_unique").on(table.simulationId, table.studentId), index("simulation_attempt_status_idx").on(table.status), index("simulation_attempt_student_idx").on(table.studentId)]);

export const appNotifications = mysqlTable("app_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("notificationType", ["deadline", "review", "unlock", "revision", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  link: varchar("link", { length: 512 }),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("notifications_user_idx").on(table.userId), index("notifications_created_idx").on(table.createdAt)]);

export const learningActivityLogs = mysqlTable("learning_activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId"),
  studentId: int("studentId"),
  moduleId: int("moduleId"),
  action: mysqlEnum("activityAction", ["deliverable_submitted", "deliverable_reviewed", "assessment_submitted", "assessment_reviewed", "revision_requested", "override_changed", "content_updated", "deadline_updated"]).notNull(),
  payload: json("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("activity_student_idx").on(table.studentId), index("activity_module_idx").on(table.moduleId), index("activity_created_idx").on(table.createdAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
