CREATE TABLE `company_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `itinerary_stops` (
	`id` text PRIMARY KEY NOT NULL,
	`driver_id` text NOT NULL,
	`date` text NOT NULL,
	`sequence` integer NOT NULL,
	`operation` text NOT NULL,
	`location` text NOT NULL,
	`planned_time` text DEFAULT '' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`instructions` text DEFAULT '' NOT NULL,
	`requirements` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
