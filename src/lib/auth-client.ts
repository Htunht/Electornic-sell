import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: "http://localhost:8080",
  fetchOptions: {
    credentials: "include",
  },
  
  plugins: [
        emailOTPClient() 
    ]
});

export const { signIn, signUp, signOut, useSession, emailOtp} = authClient;