import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { supabase } from '../lib/supabase'
import { Alert } from 'react-native';


export async function googleOAuth() {

    const redirectUrl = Linking.createURL('/Main');

    const {data,error} = await supabase.auth.signInWithOAuth({
        provider:'google',
        options:{
            redirectTo:redirectUrl,
        },
    });
    if (error){
        Alert.alert('Error', error.message);
    }
    if (data?.url){
        const result = await WebBrowser.openAuthSessionAsync(data.url,redirectUrl);
        return result;
    }
}