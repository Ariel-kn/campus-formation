CREATE TABLE `assessment_answer_key_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerKeyId` int NOT NULL,
	`studentId` int NOT NULL,
	`sentBy` int,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_answer_key_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `answer_key_recipient_unique` UNIQUE(`answerKeyId`,`studentId`)
);
--> statement-breakpoint
CREATE TABLE `assessment_answer_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`content` text NOT NULL,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_answer_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `assessment_answer_keys_assessmentId_unique` UNIQUE(`assessmentId`)
);
--> statement-breakpoint
CREATE INDEX `answer_key_recipient_student_idx` ON `assessment_answer_key_recipients` (`studentId`);