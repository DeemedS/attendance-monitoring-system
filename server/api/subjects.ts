import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { subject_code, section_code } = body;
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("subject_code", subject_code)
    .eq("section_code", section_code)
    .single();

  if (error) {
    return { statusCode: 500, error };
  }

  return { statusCode: 200, subjects };
});
