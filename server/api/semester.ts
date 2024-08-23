import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { semester_id } = body;

  const { data: semester, error } = await supabase
    .from("semesters")
    .select("*")
    .eq("id", semester_id);

  if (error) {
    return { statusCode: 500, error };
  }

  return { statusCode: 200, semester };
});
