import { signIn } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { LoginError } from '@/lib/auth-errors';

type LoginCredentials = {
  email: string;
  password: string;
};

export function useLogin() {
  return useMutation(async ({ email, password }: LoginCredentials) => {
    const result = await signIn('credentials', { email, password, redirect: false });

    if (!result?.ok || result.error) {
      throw new LoginError(result?.error);
    }
  });
}
