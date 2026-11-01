'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { BackToLoginLink } from '@/components/auth/back-to-login-link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { KeyIcon, MailIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { ApiError, apiRequest } from '@/lib/api';

const forgotPasswordFormSchema = z.object({
  email: z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('Informe um e-mail válido')),
});

type ForgotPasswordValues = z.output<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  async function requestPasswordReset({ email }: ForgotPasswordValues) {
    setErrorMessage(null);

    try {
      await apiRequest<void>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setSentTo(email);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível enviar o link agora. Tente novamente em instantes.',
      );
    }
  }

  if (sentTo) {
    return (
      <>
        <AuthHeader
          icon={<MailIcon className='size-7' />}
          title='Verifique seu e-mail'
          description={
            <>
              Se existir uma conta com <strong className='font-semibold text-slate-700'>{sentTo}</strong>,
              você vai receber um link para criar uma nova senha. O link vale por 60 minutos.
            </>
          }
        />

        <div className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'>
          {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

          <Alert variant='info'>
            Não recebeu? Confira a caixa de spam ou envie o link novamente.
          </Alert>

          <Button
            type='button'
            variant='secondary'
            loading={isSubmitting}
            loadingText='Reenviando...'
            onClick={handleSubmit(requestPasswordReset)}
          >
            Reenviar link
          </Button>
        </div>

        <BackToLoginLink />
      </>
    );
  }

  return (
    <>
      <AuthHeader
        icon={<KeyIcon className='size-7' />}
        title='Esqueceu sua senha?'
        description='Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(requestPasswordReset)}
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

        <Button type='submit' className='mt-2' loading={isSubmitting} loadingText='Enviando...'>
          Enviar link de recuperação
        </Button>
      </form>

      <BackToLoginLink />
    </>
  );
}
