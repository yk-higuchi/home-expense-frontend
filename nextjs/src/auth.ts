import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const user = { id: "1", name: "デフォルトユーザー" };
        console.log("credentials", credentials);
        console.log("request", request);
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
    // signOut: "/auth/sign-out",
    // error: "/auth/error",
  },
  callbacks: {

  }
});
