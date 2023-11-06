export interface IUser {
  id: string | null;
  name: string;
  email: string;
  bio: string;
  image: string;
  login: string;
  loginId?: number;
  emailVerified?: boolean;
  accessToken?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  createdAt?: string;
  user_id?: number;
}

declare module "next-auth" {
  interface User extends IUser {
    loginId?: number;
  }
  interface Session {
    accessToken?: string;
    sessionToken?: string;
    user: IUser;
    userId?: string;
    image?: string;
    acheivements?: string[];
  }

  interface Profile extends IUser {
    id: number;
    login?: string;
    achievements?: string[];
  }
}
declare module "next-auth/jwt" {
  interface JWT extends IUser {
    accessToken?: string;
    userId?: string;
    sessionToken?: string;
    user?: IUser;
  }
}
