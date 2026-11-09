CREATE TABLE `assessment_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`sequence` int NOT NULL,
	`questionType` enum('single','multiple','essay') NOT NULL,
	`prompt` text NOT NULL,
	`options` json,
	`correctAnswers` json,
	`maxPoints` int NOT NULL,
	CONSTRAINT `assessment_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessment_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`moduleId` int NOT NULL,
	`assessmentId` int NOT NULL,
	`answers` json NOT NULL,
	`autoScore` int,
	`manualScore` int,
	`feedback` text,
	`aiSuggestion` json,
	`submissionStatus` enum('draft','submitted','reviewed') NOT NULL DEFAULT 'draft',
	`approved` boolean NOT NULL DEFAULT false,
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_assessment_unique` UNIQUE(`studentId`,`assessmentId`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`instructions` text NOT NULL,
	`maxScore` int NOT NULL DEFAULT 20,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessments_moduleId_unique` UNIQUE(`moduleId`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`instructions` text NOT NULL,
	`expectedFormat` text NOT NULL,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`),
	CONSTRAINT `assignments_moduleId_unique` UNIQUE(`moduleId`)
);
--> statement-breakpoint
CREATE TABLE `course_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(16) NOT NULL,
	`sequence` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_modules_code_unique` UNIQUE(`code`),
	CONSTRAINT `course_modules_sequence_unique` UNIQUE(`sequence`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`moduleId` int NOT NULL,
	`assignmentId` int NOT NULL,
	`fileName` varchar(512) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`fileSize` int NOT NULL,
	`fileKey` varchar(768) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`sequence` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`duration` varchar(32) NOT NULL,
	`summary` text NOT NULL,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress_overrides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`moduleId` int NOT NULL,
	`progressOverrideState` enum('locked','unlocked') NOT NULL,
	`note` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `progress_overrides_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_module_override_unique` UNIQUE(`studentId`,`moduleId`)
);
--> statement-breakpoint
CREATE INDEX `questions_assessment_idx` ON `assessment_questions` (`assessmentId`);--> statement-breakpoint
CREATE INDEX `submissions_student_idx` ON `assessment_submissions` (`studentId`);--> statement-breakpoint
CREATE INDEX `submissions_status_idx` ON `assessment_submissions` (`submissionStatus`);--> statement-breakpoint
CREATE INDEX `deliverables_student_module_idx` ON `deliverables` (`studentId`,`moduleId`);--> statement-breakpoint
CREATE INDEX `lessons_module_idx` ON `lessons` (`moduleId`);