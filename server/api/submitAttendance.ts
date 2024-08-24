import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { attendance } = body;

  console.log(attendance);


  const { data: classes, error: classesError } = await supabase
    .from("attendance")
    .upsert(attendance)
    .select();

    console.log(classes);
    console.log(classesError);

  if (classesError) {
    return { statusCode: 500, error: classesError };
  }


  return {
    statusCode: 200,
    message: "Attendance processed successfully",
  };
});
