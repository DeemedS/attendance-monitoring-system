import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { remarks, class_id } = body;

  const { data, error } = await supabase
    .from("classes")
    .update({ remarks })
    .eq("id", class_id)
    .select();

  if (error) {
    return { statusCode: 500, error: error };
  }

  return data;
});
