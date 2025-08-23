import { supabase } from "../lib/supabase";

export async function fetchCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error("Failed to fetch user:", error.message);
        return null;
    }

    if (!user) {
        console.log("No user logged in.");
        return null;
    }

    console.log("Current User Fetched:", user);
    return user;
}
