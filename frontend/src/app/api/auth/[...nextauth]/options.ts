import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import FortyTwoProvider from "next-auth/providers/42-school";

export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_ID as string,
      clientSecret: process.env.FORTY_TWO_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,

  callbacks: {
    // to pass a value from the sign-in to the frontend, client-side,
    // you can use a combination of the session and jwt callback like so:
    async jwt({ token, profile, account }) {
      // invalidPrimaryCampus(profile);
      if (profile && account && token) {
        // we pass user_id, login and access_token to the frontend via token
        token.user_id = profile?.id;
        token.login = profile?.login as string;
        token.accessToken = account.access_token;
        token.image = profile?.image?.link.toString() as string;
        token.acheivements = profile?.achievements;
      }
      return token;
    },
    async session({ session, token }) {
      // we received user_id, login and access_token from the jwt callback
      if (token && session.user) {
        session.user.login = token.login;
        session.user.user_id = token.user_id;
        session.accessToken = token.accessToken;
        session.image = token.image;
        session.acheivements = token.acheivements as string[];
        // console.log("session.image", session.acheivements[0]);
      }
      return session;
    },
  },
};
