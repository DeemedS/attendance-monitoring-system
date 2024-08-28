import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { formAction, subject_id, assigned, subject_code, section_code } = body;

  if (!formAction) {
    return { statusCode: 400, error: "Invalid request" };
  }

  switch (formAction.toUpperCase()) {
    case "GETSUBJECTCODE": {
      const { data: code, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subject_id)
        .single();

      if (error) {
        return { statusCode: 500, error };
      }

      return code;
    }

    case "GETSTUDENTSLISTDATA": {
      const { data: subjectWithClasses, error: subjectError } = await supabase
        .from("subjects")
        .select(
          `
          *,
          classes:classes(*)
        `
        )
        .eq("subject_code", subject_code)
        .eq("section_code", section_code)
        .single();

      if (subjectError) {
        return { statusCode: 500, error: subjectError };
      }

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select(
          `*,
          attendances:attendance(*)`
        )
        .eq(
          "subjects",
          JSON.stringify([
            {
              section_code: section_code,
              subject_code: subject_code,
            },
          ])
        );

      if (studentsError) {
        return { statusCode: 500, error: studentsError };
      }

      if (subjectWithClasses) {
        subjectWithClasses.students = students;
      }

      return subjectWithClasses;
    }

    case "GETSUBJECTID": {
      const { data: subject, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("subject_code", subject_code)
        .eq("section_code", section_code)
        .single();

      if (error) {
        return { statusCode: 500, error };
      }

      return subject.id;
    }

    case "GETASSIGNEDSUBJECTS": {
      const { data: assignedSubjects, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("assigned", assigned);

      if (error) {
        return { statusCode: 500, error };
      }

      const subjectsWithSections = assignedSubjects.reduce((acc, subject) => {
        const subjectCode = subject.subject_code;

        let existingSubject = acc.find(
          (s: { name: any; }) => s.name === subjectCode
        );
        if (!existingSubject) {
          existingSubject = { name: subjectCode, sections: [] };
          acc.push(existingSubject);
        }
        existingSubject.sections.push({ name: subject.section_code });

        return acc;
      }, []);

      return subjectsWithSections;
    }

    default:
      return { statusCode: 400, error: "Invalid form action" };
  }
});
