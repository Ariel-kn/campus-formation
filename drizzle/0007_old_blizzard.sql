ALTER TABLE `deliverables` ADD `manualScore` int;--> statement-breakpoint
ALTER TABLE `deliverables` ADD `feedback` text;--> statement-breakpoint
ALTER TABLE `deliverables` ADD `approved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `deliverables` ADD `reviewedAt` timestamp;
ALTER TABLE `deliverables` ADD `reviewedAt` timestamp;
