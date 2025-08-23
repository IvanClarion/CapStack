import { supabase } from "../lib/supabase";

export async function signOut() {
    
    try{
    const {error} = await supabase.auth.signOut();
    console.log('Success');
    return{error};
    } catch (error){
        console.log('Error');
        return {error};
    }
}