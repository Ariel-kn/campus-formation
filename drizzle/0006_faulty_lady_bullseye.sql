ALTER TABLE `course_modules` DROP INDEX `course_modules_sequence_unique`;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `cohort` varchar(80) DEFAULT 'Gestion des médias sociaux' NOT NULL;--> statement-breakpoint
ALTER TABLE `course_modules` DROP INDEX `course_modules_sequence_unique`;--> statement-breakpoint
ALTER TABLE `course_modules` ADD CONSTRAINT `cohort_module_sequence_unique` UNIQUE(`cohort`,`sequence`);
