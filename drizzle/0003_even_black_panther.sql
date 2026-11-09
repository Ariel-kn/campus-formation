CREATE TABLE `app_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` enum('deadline','review','unlock','revision','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`link` varchar(512),
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int,
	`studentId` int,
	`moduleId` int,
	`activityAction` enum('deliverable_submitted','assessment_submitted','assessment_reviewed','revision_requested','override_changed','content_updated','deadline_updated') NOT NULL,
	`payload` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`sequence` int NOT NULL,
	`resourceType` enum('link','note') NOT NULL DEFAULT 'link',
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` varchar(1024),
	`content` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rubric_criteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rubricId` int NOT NULL,
	`sequence` int NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`maxPoints` int NOT NULL,
	CONSTRAINT `rubric_criteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rubrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rubrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `rubrics_assessmentId_unique` UNIQUE(`assessmentId`)
);
--> statement-breakpoint
ALTER TABLE `assessment_submissions` ADD `attempt` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `assessment_submissions` ADD `returnRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `assessment_submissions` ADD `returnNote` text;--> statement-breakpoint
ALTER TABLE `assessment_submissions` ADD `isLate` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `assessments` ADD `dueAt` timestamp;--> statement-breakpoint
ALTER TABLE `assessments` ADD `allowRetake` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `assignments` ADD `dueAt` timestamp;--> statement-breakpoint
ALTER TABLE `assignments` ADD `allowResubmission` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `isPublished` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `app_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_created_idx` ON `app_notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `activity_student_idx` ON `learning_activity_logs` (`studentId`);--> statement-breakpoint
CREATE INDEX `activity_module_idx` ON `learning_activity_logs` (`moduleId`);--> statement-breakpoint
CREATE INDEX `activity_created_idx` ON `learning_activity_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `resources_module_idx` ON `learning_resources` (`moduleId`);--> statement-breakpoint
CREATE INDEX `criteria_rubric_idx` ON `rubric_criteria` (`rubricId`);