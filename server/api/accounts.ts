import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { user_id } = body;

  const { data: account_id, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user_id);

  const accountId = account_id ? account_id[0].id : null;

  if (error) {
    return { statusCode: 500, error };
  }

  return { statusCode: 200, accountId };
});
