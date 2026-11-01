import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { ApiError, apiRequest } from './api';
import { LOGIN_ERRORS, type LoginErrorCode } from './auth-errors';

const SESSION_MAX_AGE_IN_SECONDS = 24 * 60 * 60;

type Company = {
  id: string;
  name: string;
  logo: string | null;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  companies: Company[];
};

type SelectCompanyResponse = {
  token: string;
  company: Company;
  permissions: string[];
};

type CompanyAccess = {
  accessToken: string;
  accessTokenExpires: number;
  company: Company | null;
  permissions: string[];
};

function toLoginErrorCode(error: unknown, forbiddenCode: LoginErrorCode): LoginErrorCode {
  if (!(error instanceof ApiError)) {
    return LOGIN_ERRORS.UNKNOWN;
  }

  if (error.status === 0) {
    return LOGIN_ERRORS.SERVICE_UNAVAILABLE;
  }

  if (error.status === 400 || error.status === 401) {
    return LOGIN_ERRORS.INVALID_CREDENTIALS;
  }

  if (error.status === 403) {
    return forbiddenCode;
  }

  return LOGIN_ERRORS.UNKNOWN;
}

function getTokenExpiration(accessToken: string): number {
  try {
    const [, payload] = accessToken.split('.');
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: unknown;
    };

    if (typeof exp === 'number') {
      return exp * 1000;
    }
  } catch {}

  return Date.now() + SESSION_MAX_AGE_IN_SECONDS * 1000;
}

async function selectCompany(accessToken: string, companyId: string): Promise<CompanyAccess> {
  const selection = await apiRequest<SelectCompanyResponse>('/auth/select-company', {
    method: 'POST',
    body: { companyId },
    token: accessToken,
  });

  return {
    accessToken: selection.token,
    accessTokenExpires: getTokenExpiration(selection.token),
    company: selection.company,
    permissions: selection.permissions,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_IN_SECONDS,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error(LOGIN_ERRORS.INVALID_CREDENTIALS);
        }

        const login = await apiRequest<LoginResponse>('/auth/login', {
          method: 'POST',
          body: { email: credentials.email, password: credentials.password },
        }).catch((error: unknown) => {
          throw new Error(toLoginErrorCode(error, LOGIN_ERRORS.INACTIVE_USER));
        });

        if (login.companies.length === 0) {
          throw new Error(LOGIN_ERRORS.NO_COMPANY);
        }

        const access =
          login.companies.length === 1
            ? await selectCompany(login.token, login.companies[0].id).catch((error: unknown) => {
                throw new Error(toLoginErrorCode(error, LOGIN_ERRORS.NO_COMPANY));
              })
            : {
                accessToken: login.token,
                accessTokenExpires: getTokenExpiration(login.token),
                company: null,
                permissions: [],
              };

        return {
          id: login.user.id,
          name: login.user.name,
          email: login.user.email,
          companies: login.companies,
          ...access,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.accessToken = user.accessToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.company = user.company;
        token.companies = user.companies;
        token.permissions = user.permissions;
      }

      if (trigger === 'update' && typeof session?.companyId === 'string') {
        const access = await selectCompany(token.accessToken, session.companyId).catch(() => null);

        if (access) {
          Object.assign(token, access);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        name: token.name ?? '',
        email: token.email ?? '',
      };
      session.accessToken = token.accessToken;
      session.company = token.company;
      session.companies = token.companies;
      session.permissions = token.permissions;

      return session;
    },
  },
};
