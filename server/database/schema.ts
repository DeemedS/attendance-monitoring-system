import {
  pgTable,
  unique,
  serial,
  varchar,
  foreignKey,
  integer,
  date,
  time,
  text,
  json,
  jsonb,
  uuid,
  pgSchema,
} from "drizzle-orm/pg-core";

const authSchema = pgSchema('auth');

export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});


export const attendance = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey().notNull(),
    studentNumber: varchar("student_number", { length: 255 }).notNull(),
    classId: integer("class_id").notNull(),
    status: varchar("status", { length: 255 }).default("").notNull(),
  },
  (table) => {
    return {
      attendanceClassIdFkey: foreignKey({
        columns: [table.classId],
        foreignColumns: [classes.id],
        name: "attendance_class_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
      attendanceStudentNumberFkey: foreignKey({
        columns: [table.studentNumber],
        foreignColumns: [students.studentNumber],
        name: "attendance_student_number_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
    };
  }
);

export const classes = pgTable(
  "classes",
  {
    id: serial("id").primaryKey().notNull(),
    sectionCode: varchar("section_code", { length: 255 }).notNull(),
    classDate: date("class_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    subjectId: integer("subject_id"),
    remarks: text("remarks"),
  },
  (table) => {
    return {
      classesSubjectIdFkey: foreignKey({
        columns: [table.subjectId],
        foreignColumns: [subjects.id],
        name: "classes_subject_id_fkey",
      })
        .onUpdate("cascade")
        .onDelete("cascade"),
    };
  }
);

export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey().notNull(),
    subjectCode: varchar("subject_code", { length: 255 }).notNull(),
    sectionCode: varchar("section_code", { length: 255 }).notNull(),
    schedule: json("schedule").notNull(),
    room: varchar("room", { length: 255 }).notNull(),
    instructor: varchar("instructor", { length: 255 }).notNull(),
    assigned: integer("assigned"),
  },
  (table) => {
    return {
      subjectsAssignedFkey: foreignKey({
        columns: [table.assigned],
        foreignColumns: [accounts.id],
        name: "subjects_assigned_fkey",
      })
        .onUpdate("cascade")
        .onDelete("set null"),
    };
  }
);

export const semesters = pgTable(
  "semesters",
  {
    id: serial("id").primaryKey().notNull(),
    semester: varchar("semester", { length: 255 }).notNull(),
    schoolYear: varchar("school_year", { length: 255 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
  },
  (table) => {
    return {
      semestersSemesterUnique: unique("semesters_semester_unique").on(
        table.semester
      ),
    };
  }
);

export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey().notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    middleName: varchar("middle_name", { length: 255 }),
    sectionCode: varchar("section_code", { length: 255 }).notNull(),
    studentNumber: varchar("student_number", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    delivery: varchar("delivery", { length: 255 })
      .default("face-to-face")
      .notNull(),
    remarks: varchar("remarks", { length: 255 }),
    subjects: jsonb("subjects")
      .default([{ section_code: "2PCMPE-E4", subject_code: "CMPE 40223" }])
      .notNull(),
  },
  (table) => {
    return {
      studentsStudentNumberUnique: unique("students_student_number_unique").on(
        table.studentNumber
      ),
    };
  }
);

export const accounts = pgTable(
  "accounts",
  {
    id: serial("id").primaryKey().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => {
    return {
      accountsUserIdUsersIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "accounts_user_id_users_id_fk",
      }),
      accountsEmailUnique: unique("accounts_email_unique").on(table.email),
      accountsUsernameUnique: unique("accounts_username_unique").on(
        table.username
      ),
    };
  }
);
