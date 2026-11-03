'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthHeader } from '@/components/auth/auth-header';
import { AuthSwitchLink } from '@/components/auth/auth-switch-link';
import { Alert } from '@/components/ui/alert';
import { Button, buttonStyles } from '@/components/ui/button';
import { BuildingIcon, CheckCircleIcon, MailIcon, UserIcon } from '@/components/ui/icons';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { ApiError, apiRequest } from '@/lib/api';
import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';

const signUpFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome'),
    email: z.string().trim().min(1, 'Informe seu e-mail').pipe(z.email('Informe um e-mail válido')),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`),
    passwordConfirmation: z.string().min(1, 'Confirme sua senha'),
    companyName: z.string().trim().min(1, 'Informe o nome da empresa'),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'As senhas não conferem',
    path: ['passwordConfirmation'],
  });

type SignUpValues = z.output<typeof signUpFormSchema>;

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className='flex flex-col gap-5'>
      <div className='border-b border-slate-200 pb-3'>
        <h2 className='text-base font-bold text-slate-900'>{title}</h2>
        <p className='mt-0.5 text-sm text-slate-500'>{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function SignUpForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdCompanyName, setCreatedCompanyName] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpFormSchema),
  });

  async function handleSignUp({ name, email, password, companyName }: SignUpValues) {
    setErrorMessage(null);

    try {
      await apiRequest<unknown>('/auth/sign-up', {
        method: 'POST',
        body: { name, email, password, companyName },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError('email', { message: error.message });
        return;
      }

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível criar sua conta agora. Tente novamente em instantes.',
      );
      return;
    }

    const result = await signIn('credentials', { email, password, redirect: false });

    if (!result?.ok || result.error) {
      setCreatedCompanyName(companyName);
      return;
    }

    setIsRedirecting(true);
    window.location.assign(DEFAULT_CALLBACK_URL);
  }

  if (createdCompanyName) {
    return (
      <>
        <AuthHeader
          icon={<CheckCircleIcon className='size-7' />}
          title='Conta criada!'
          description={`Sua conta e a empresa ${createdCompanyName} foram criadas, mas não conseguimos entrar automaticamente. Entre com seu e-mail e senha para continuar.`}
        />

        <Link href='/auth/login' className={buttonStyles('primary', 'animate-fade-up')}>
          Ir para o login
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title='Crie sua conta'
        description='Cadastre seus dados e os da sua empresa. Você será o administrador da empresa.'
      />

      <form
        noValidate
        onSubmit={handleSubmit(handleSignUp)}
        className='flex flex-col gap-8 animate-fade-up [animation-delay:80ms]'
      >
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

        <FormSection title='Seus dados' description='Você vai usar o e-mail e a senha para entrar.'>
          <TextField
            label='Nome'
            autoComplete='name'
            placeholder='Seu nome completo'
            icon={<UserIcon />}
            error={errors.name?.message}
            {...register('name')}
          />

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
            autoComplete='new-password'
            placeholder='Crie uma senha'
            hint={`Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordField
            label='Confirmar senha'
            autoComplete='new-password'
            placeholder='Repita a senha'
            error={errors.passwordConfirmation?.message}
            {...register('passwordConfirmation')}
          />
        </FormSection>

        <FormSection title='Sua empresa' description='Depois você poderá convidar sua equipe.'>
          <TextField
            label='Nome da empresa'
            autoComplete='organization'
            placeholder='Nome da sua empresa'
            icon={<BuildingIcon />}
            error={errors.companyName?.message}
            {...register('companyName')}
          />
        </FormSection>

        <Button
          type='submit'
          loading={isSubmitting || isRedirecting}
          loadingText={isRedirecting ? 'Entrando...' : 'Criando conta...'}
        >
          Criar conta
        </Button>
      </form>

      <AuthSwitchLink question='Já tem uma conta?' href='/auth/login' label='Entrar' />
    </>
  );
}
