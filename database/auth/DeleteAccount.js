import { supabase } from "../lib/supabase";
import { fetchCurrentUser } from "./FetchAuth";
import { SUPABASE_EDGE_DELETE_USER } from "@env";

export async function deleteCurrentUser() {
  try {
    const user = await fetchCurrentUser();
    if (!user) {
      console.log("No user logged in!");
      return { success: false, error: "No user logged in" };
    }

    // get current session
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("No session found");

    // call Edge Function
   
const res = await fetch(SUPABASE_EDGE_DELETE_USER, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({ userId: user.id }),
});

    // Always read the raw body once
    const raw = await res.text();
    console.log("Edge function raw response:", raw);

    if (!res.ok) {
      throw new Error(`Edge Function error (${res.status}): ${raw}`);
    }

    // Try parse as JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Edge function did not return valid JSON");
    }

    // sign out locally after successful deletion
    await supabase.auth.signOut();

    console.log("User deleted:", user.id);
    return { success: true, data };
  } catch (err) {
    console.error("Delete error:", err.message);
    return { success: false, error: err.message };
  }
}
