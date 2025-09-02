import { supabase } from "../lib/supabase";

export async function fetchCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to fetch session:", error.message);
    return null;
  }

  const user = session?.user ?? null;

  if (!user) {
    console.log("No user logged in.");
    return null;
  }

  console.log("Current User Fetched:", user);
  return user;
}
