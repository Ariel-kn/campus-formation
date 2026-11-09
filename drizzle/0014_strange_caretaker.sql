CREATE TABLE `formative_simulation_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`simulationId` int NOT NULL,
	`studentId` int NOT NULL,
	`simulationAttemptStatus` enum('draft','submitted','expired') NOT NULL DEFAULT 'draft',
	`startedAt` timestamp,
	`submittedAt` timestamp,
	`lastSavedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`currentStep` int NOT NULL DEFAULT 0,
	`score` int NOT NULL DEFAULT 0,
	`responses` json NOT NULL,
	`metrics` json NOT NULL,
	CONSTRAINT `formative_simulation_attempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `simulation_attempt_student_unique` UNIQUE(`simulationId`,`studentId`)
);
--> statement-breakpoint
CREATE TABLE `formative_simulation_choices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stepId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` text NOT NULL,
	`consequence` text NOT NULL,
	`feedback` text NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`metrics` json NOT NULL,
	CONSTRAINT `formative_simulation_choices_id` PRIMARY KEY(`id`),
	CONSTRAINT `simulation_choice_unique` UNIQUE(`stepId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `formative_simulation_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`simulationId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`sequence` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`context` text NOT NULL,
	`objective` text NOT NULL,
	`imageKey` varchar(32) NOT NULL,
	CONSTRAINT `formative_simulation_steps_id` PRIMARY KEY(`id`),
	CONSTRAINT `simulation_step_unique` UNIQUE(`simulationId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `formative_simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`cohort` varchar(80) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`durationSeconds` int NOT NULL DEFAULT 7200,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formative_simulations_id` PRIMARY KEY(`id`),
	CONSTRAINT `formative_simulations_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE INDEX `simulation_attempt_status_idx` ON `formative_simulation_attempts` (`simulationAttemptStatus`);--> statement-breakpoint
CREATE INDEX `simulation_attempt_student_idx` ON `formative_simulation_attempts` (`studentId`);--> statement-breakpoint
CREATE INDEX `simulation_choices_step_idx` ON `formative_simulation_choices` (`stepId`);--> statement-breakpoint
CREATE INDEX `simulation_steps_simulation_idx` ON `formative_simulation_steps` (`simulationId`);