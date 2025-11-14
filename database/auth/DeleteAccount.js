import { supabase } from "../lib/supabase";
import { fetchCurrentUser } from "./FetchAuth";
import { SUPABASE_EDGE_DELETE_USER } from "@env";

// Expect an object with { password }
export async function deleteCurrentUser({ password }) {
  try {
    const user = await fetchCurrentUser();
    if (!user) {
      console.log("No user logged in!");
      return { success: false, error: "No user logged in" };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: "Password is required" };
    }

    // get current session
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;
    const session = sessionData?.session;
    if (!session) throw new Error("No session found");

    if (!SUPABASE_EDGE_DELETE_USER) {
      throw new Error("SUPABASE_EDGE_DELETE_USER is not configured");
    }

    // call Edge Function
    const res = await fetch(SUPABASE_EDGE_DELETE_USER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ password }),
    });

    const raw = await res.text();
    console.log("Edge function raw response:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = data?.error || raw || `status ${res.status}`;
      throw new Error(msg);
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