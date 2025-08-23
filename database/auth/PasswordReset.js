// hooks/useResetPassword.js
import { useState } from "react";
import { supabase } from "../lib/supabase"; // adjust path

export function useResetPassword() {
  const [loading, setLoading] = useState(false);

  /**
   * Update password for current user or using access token from email link
   * @param {string} newPassword - The new password
   * @param {string} [accessToken] - Optional access token from email link
   * @returns {Object} { success: boolean, error?: any }
   */
  const updatePassword = async (newPassword, accessToken) => {
    if (!newPassword) return { success: false, error: "Password is required" };

    setLoading(true);

    let result;
    try {
      if (accessToken) {
        // Set session using the access token from the email link
        await supabase.auth.setSession({ access_token: accessToken });
      }

      result = await supabase.auth.updateUser({ password: newPassword });
    } catch (err) {
      setLoading(false);
      console.log("Unexpected error:", err);
      return { success: false, error: err };
    }

    setLoading(false);

    if (result.error) {
      console.log("Password update error:", result.error.message);
      return { success: false, error: result.error };
    }

    return { success: true };
  };

  return { loading, updatePassword };
}
