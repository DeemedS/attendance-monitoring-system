import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { subject_code, section_code, class_id } = body;

  if (!subject_code || (!section_code && class_id)) {
    const { data: classes, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", class_id);

    if (error) {
      return { statusCode: 500, error };
    }

    return { statusCode: 200, class: classes[0] };
  } else if (subject_code && section_code) {
    const { data: classes, error } = await supabase
      .from("classes")
      .select("*")
      .eq("subject_code", subject_code)
      .eq("section_code", section_code);

    if (error) {
      return { statusCode: 500, error };
    }

    return { statusCode: 200, classes };
  } else {
    return {
      statusCode: 400,
      error: "Missing subject_code, section_code, or class_id",
    };
  }
});
