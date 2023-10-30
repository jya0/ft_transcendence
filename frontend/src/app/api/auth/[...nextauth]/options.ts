import type { NextAuthOptions, Session, DefaultSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async session({ session, token, user, newSession }) {
      const { name, email, image } = user;
      session.user = { name, email, image };
      return session;
    },
  },
};
