import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { formMethod, subject_id, assigned, subject_code, section_code } = body;

  if (formMethod) {
    const method = formMethod.toUpperCase();
    if (method === "GETSUBJECTCODE"){
      const { data: code, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subject_id)
        .single();

      if (error) {
        return { statusCode: 500, error };
      }

      return code
    }
  }

  if (assigned && !subject_code && !section_code) {
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
        (s: { name: any }) => s.name === subjectCode
      );
      if (!existingSubject) {
        existingSubject = { name: subjectCode, sections: [] };
        acc.push(existingSubject);
      }
      existingSubject.sections.push({ name: subject.section_code });

      return acc;
    }, []);

    return subjectsWithSections;
  } else if (subject_code && section_code) {
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
  } else {
    return { statusCode: 400, error: "Invalid request" };
  }
});
