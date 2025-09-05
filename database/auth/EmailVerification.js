import { supabase } from "../lib/supabase";

export const resetPasswordToEmail = async (email) => {
  if (!email) return false;

  const redirectTo = "http://192.168.137.242:8081/ResetPassword";

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    console.error("Supabase error:", error.message);
    return false;
  }

  return true;
};
