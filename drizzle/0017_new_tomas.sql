ALTER TABLE `enrollments` ADD `intake` varchar(80) DEFAULT 'Rentrée 1 — Septembre 2026' NOT NULL;--> statement-breakpoint
CREATE INDEX `enrollments_intake_idx` ON `enrollments` (`intake`);