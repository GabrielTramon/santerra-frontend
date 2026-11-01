'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MailIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { getLoginErrorMessage } from '@/lib/auth-errors';

const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('Informe um e-mail válido')),
  password: z.string().min(1, 'Informe sua senha'),
});

type LoginFormProps = {
  callbackUrl: string;
  initialError?: string;
};

export default function LoginForm({ callbackUrl, initialError }: LoginFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError ? getLoginErrorMessage(initialError) : null,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
  });

  async function handleLogin(values: z.output<typeof loginFormSchema>) {
    setErrorMessage(null);

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result?.ok || result.error) {
      setErrorMessage(getLoginErrorMessage(result?.error));
      return;
    }

    setIsRedirecting(true);
    window.location.assign(callbackUrl);
  }

  return (
    <>
      <AuthHeader
        title='Bem-vindo de volta'
        description='Entre com seu e-mail e senha para acessar o painel.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleLogin)}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

        <TextField
          label='E-mail'
          type='email'
          autoComplete='email'
          placeholder='seu@email.com'
          icon={<MailIcon />}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordField
          label='Senha'
          autoComplete='current-password'
          placeholder='Digite sua senha'
          error={errors.password?.message}
          labelAction={
            <Link
              href='/auth/forgot-password'
              className='rounded text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
            >
              Esqueceu sua senha?
            </Link>
          }
          {...register('password')}
        />

        <Button
          type='submit'
          className='mt-2'
          loading={isSubmitting || isRedirecting}
          loadingText='Entrando...'
        >
          Entrar
        </Button>
      </form>
    </>
  );
}
