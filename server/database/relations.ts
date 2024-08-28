import { relations } from "drizzle-orm/relations";
import {
  classes,
  attendance,
  students,
  subjects,
  accounts,
  users,
} from "./schema";

export const attendanceRelations = relations(attendance, ({ one }) => ({
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  student: one(students, {
    fields: [attendance.studentNumber],
    references: [students.studentNumber],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  attendances: many(attendance),
  subject: one(subjects, {
    fields: [classes.subjectId],
    references: [subjects.id],
  }),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  attendances: many(attendance),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  classes: many(classes),
  account: one(accounts, {
    fields: [subjects.assigned],
    references: [accounts.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  subjects: many(subjects),
  usersInAuth: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const usersInAuthRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));
