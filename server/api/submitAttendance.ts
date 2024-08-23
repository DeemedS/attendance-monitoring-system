import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { attendance } = body;

  const results = [];

  for (const record of attendance) {
    const { student_number, status, class_id } = record;

    const { data: existingRecord, error: selectError } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_number", student_number)
      .eq("class_id", class_id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      results.push({ student_number, error: selectError });
      continue;
    }

    if (existingRecord) {
      const { data, error: updateError } = await supabase
        .from("attendance")
        .update({ status: status })
        .eq("student_number", student_number)
        .eq("class_id", class_id);

      if (updateError) {
        results.push({ student_number, error: updateError });
      } else {
        results.push({ student_number, data, updated: true });
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("attendance")
        .insert({
          student_number: student_number,
          status: status,
          class_id: class_id,
        });

      if (insertError) {
        results.push({ student_number, error: insertError });
      } else {
        results.push({ student_number, data, inserted: true });
      }
    }
  }
  const hasErrors = results.some((result) => result.error);

  if (hasErrors) {
    return { statusCode: 500, results };
  }

  return {
    statusCode: 200,
    message: "Attendance processed successfully",
    results,
  };
});
