import { defineEventHandler, readBody } from "h3";
import { supabase } from "@/server/utils/supabase";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, username } = body;

  if (!email || !password || !username) {
    return { statusCode: 400, body: { error: "All fields are required" } };
  }

  const {data: existData, error: existingUserError } = await supabase
    .from("accounts")
    .select('email, username')
    .or(`email.eq.${email},username.eq.${username}`);

    console.log(existingUserError);

    if (existData && existData.length > 0) {
        return { statusCode: 409, error: existingUserError, body: { message: "User Already exist" } };
    }


  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (authError) {
    return { statusCode: 500, error: authError };
    }
    


  const { data: userData, error: insertError } = await supabase
  .from("accounts")
  .insert({ 
    email: email,
    username: username,
    user_id: authData?.user?.id,
   });


  if (insertError) {
    return { statusCode: 500, error: insertError };
  }

  return { statusCode: 201, body: { message: "User registered successfully" }, userData };
});
