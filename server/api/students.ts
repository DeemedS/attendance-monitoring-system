import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { section_code, subject_code, student_number } = body;

  if (student_number) {
    const { data: studentInfo, error } = await supabase
    .from('students')
    .select('*')
    .filter('student_number', 'eq', student_number)
    .single();
  
    if (error) {
      return { statusCode: 500, error };
    }

    return studentInfo ;
  }

  if (section_code && subject_code) {
    const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .filter('subjects', 'cs', `[{"subject_code": "${subject_code}", "section_code": "${section_code}"}]`);
  
    if (error) {
      return { statusCode: 500, error };
    }

    return { statusCode: 200, students };
  }
});
