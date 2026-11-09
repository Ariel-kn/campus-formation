CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enrollmentStatus` enum('active','suspended') NOT NULL DEFAULT 'active',
	`cohort` varchar(80) NOT NULL DEFAULT 'Gestion des médias sociaux',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `enrollments_userId_unique` UNIQUE(`userId`)
);
