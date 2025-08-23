import { supabase } from "../lib/supabase";

export async function signIn(email,password) {
    try{
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,

        })
        return {data, error};
    }catch(error){
        console.log(error.message);
        return{data:null, error};
    }
}