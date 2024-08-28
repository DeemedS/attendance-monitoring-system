import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { attendance_id, status } = body;

  const { data, error } = await supabase
    .from("attendance")
    .update({ status })
    .eq("id", attendance_id)
    .select(`*, class: classes(*)`);

  if (error) {
    return { statusCode: 500, error };
  }

  const class_date = data.map(
    (record: { class: { class_date: any } }) => record.class.class_date
  );

  console.log(class_date);
  return {
    statusCode: 200,
    message: "Updated successfully",
    class_date,
  };
});
