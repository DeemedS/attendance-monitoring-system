import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { class_id, student_number } = body;

  if (class_id) {
    const { data: attendance, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("class_id", class_id)

  if (error) {
    return { statusCode: 500, error };
  }

  return { statusCode: 200, attendance };
  }

  if (student_number) {
    const { data: attendance, error } = await supabase
    .from("attendance")
    .select("*, class: classes(*, subjects(*))")
    .eq("student_number", student_number) 

    return attendance;
  }
});
