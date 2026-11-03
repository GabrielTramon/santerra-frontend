import type { DefaultSession } from 'next-auth';

type SessionCompany = {
  id: string;
  name: string;
  logo: string | null;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    } & DefaultSession['user'];
    accessToken: string;
    company: SessionCompany | null;
    companies: SessionCompany[];
    permissions: string[];
  }

  interface User {
    accessToken: string;
    accessTokenExpires: number;
    company: SessionCompany | null;
    companies: SessionCompany[];
    permissions: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    accessToken: string;
    accessTokenExpires: number;
    company: SessionCompany | null;
    companies: SessionCompany[];
    permissions: string[];
  }
}
