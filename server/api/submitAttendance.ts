import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { attendance } = body;


  const recordsWithId = attendance.filter((record: { id: null | undefined; }) => record.id !== null && record.id !== undefined);
  const recordsWithoutId = attendance.filter((record: { id: null | undefined; }) => record.id === null || record.id === undefined);
  const recordsWithoutIds = recordsWithoutId.map(({ id, ...rest }: { id: any, [key: string]: any }) => rest);


  
  if (recordsWithoutId.length > 0) {
    const { error: insertError } = await supabase
      .from("attendance")
      .insert(recordsWithoutIds)
      .select();

    if (insertError) {
      return { statusCode: 500, error: insertError };
    }
  }

  if (recordsWithId.length > 0) {
    const { error: upsertError } = await supabase
      .from("attendance")
      .upsert(recordsWithId, { onConflict: "id" })
      .select();

    if (upsertError) {
      return { statusCode: 500, error: upsertError };
    }
  }

  return {
    statusCode: 200,
    message: "Attendance processed successfully",
  };
});
