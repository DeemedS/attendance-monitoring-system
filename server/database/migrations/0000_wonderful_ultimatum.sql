CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_number" varchar(255) NOT NULL,
	"class_id" integer NOT NULL,
	"status" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"section_code" varchar(255) NOT NULL,
	"class_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"subject_id" integer,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "semesters" (
	"id" serial PRIMARY KEY NOT NULL,
	"semester" varchar(255) NOT NULL,
	"school_year" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	CONSTRAINT "semesters_semester_unique" UNIQUE("semester")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"middle_name" varchar(255),
	"section_code" varchar(255) NOT NULL,
	"student_number" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"delivery" varchar(255) DEFAULT 'face-to-face' NOT NULL,
	"remarks" varchar(255),
	"subjects" jsonb DEFAULT '[{"section_code":"2PCMPE-E4","subject_code":"CMPE 40223"}]'::jsonb NOT NULL,
	CONSTRAINT "students_student_number_unique" UNIQUE("student_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_code" varchar(255) NOT NULL,
	"section_code" varchar(255) NOT NULL,
	"schedule" json NOT NULL,
	"room" varchar(255) NOT NULL,
	"instructor" varchar(255) NOT NULL,
	"assigned" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_number_fkey" FOREIGN KEY ("student_number") REFERENCES "public"."students"("student_number") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "classes" ADD CONSTRAINT "classes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subjects" ADD CONSTRAINT "subjects_assigned_fkey" FOREIGN KEY ("assigned") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
