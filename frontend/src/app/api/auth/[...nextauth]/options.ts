import type { NextAuthOptions, Session, DefaultSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import FortyTwoProvider from "next-auth/providers/42-school";

interface CampusUser {
  is_primary: boolean;
  campus_id: string;
}

const invalidPrimaryCampus = (profile: any) => {
  const campusId = profile.campus_users.find(
    (cu: CampusUser) => cu.is_primary
  )?.campus_id;

  return campusId?.toString() !== process.env.CAMPUS_ID;
};

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
      if (profile && account) {
        // we pass user_id, login and access_token to the frontend via token
        token.user_id = profile?.id;
        token.login = profile.login;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // we received user_id, login and access_token from the jwt callback
      if (token) {
        session.user.login = token.login;
        session.user.user_id = token.user_id;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
