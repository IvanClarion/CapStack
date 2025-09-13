import { supabase } from "../lib/supabase";

export async function useSignUp(name, email, password, phone) {
  // 1. Create user in auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone,
      },
    },
  });

  if (error) {
    return { error, data: null };
  }

  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase.from("public_users").insert([
      {
        id: user.id,
        full_name: name,
        email,
        phone,
        is_premium: false,
      },
    ]);

    if (profileError) {
      console.error("Creating Profile Failed", profileError);
      return { error: profileError, data: null };
    }
  }

  return { error: null, data };
}
