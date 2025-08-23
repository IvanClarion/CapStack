import { supabase } from "../lib/supabase";

export async function useSignUp(name, email, password) {
    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    });
    return { error, data };
}