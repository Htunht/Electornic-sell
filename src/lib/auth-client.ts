import { createAuthClient } from "better-auth/react";

export const {signIn, signUp, signOut, useSession} = createAuthClient({
  baseURL: "http://localhost:8080",
  fetchOptions: {
    credentials: "include",
  },
});
