import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { section_code } = body;

  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("section_code", section_code);

  if (error) {
    return { statusCode: 500, error };
  }

  return { statusCode: 200, students };
});
