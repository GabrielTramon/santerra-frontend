'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type ICredentialsProps = {
  email?: string;
  password?: string;
};

const handleLoginFormSchema = z.object({
  email: z.string().email('Insira um email valido'),
  password: z
    .string()
    .min(6, 'Sua senha deve ter no mínimo 6 caracteres')
    .max(32, 'Sua senha deve ter no máximo 32 caracteres'),
});

export default function LoginPage() {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ICredentialsProps>({
    mode: 'onSubmit',
    resolver: zodResolver(handleLoginFormSchema),
  });

  const [showModal, setShowModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const session = useSession();

  async function handleLogin({ email, password }: ICredentialsProps) {
    let redirectPath = localStorage.getItem('redirect-after-login');

    if (!redirectPath || typeof redirectPath !== 'string' || !redirectPath.startsWith('/')) {
      redirectPath = '/admin';
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: `${window.location.origin}${redirectPath}`,
      });

      if (!result || result?.error) {
        if (result?.error === 'CredentialsSignin') {
          setShowModal(true);
        } else {
          setShowIncorrectModal(true);
        }
      } else {
        setRedirectTo(result.url);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setShowIncorrectModal(true);
    }
  }

  useEffect(() => {
    if (redirectTo && typeof redirectTo === 'string') {
      localStorage.removeItem('redirect-after-login');
      if (session.data?.permissions.includes('dashboardAccess'))
        window.location.href = redirectTo.startsWith('/admin')
          ? redirectTo
          : `${window.location.origin}/admin`;
      else setShowIncorrectModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTo]);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <>
      <div className='min-h-screen flex flex-col lg:flex-row'>
        <div className='hidden lg:flex lg:w-[46%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex-col items-center justify-center px-14 py-16'>
          <div className='blob-a absolute -top-28 -left-28 w-[26rem] h-[26rem] rounded-full bg-white/[0.07]' />
          <div className='blob-b absolute -bottom-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-white/[0.06]' />
          <div className='blob-a absolute top-1/2 left-1/3 w-52 h-52 rounded-full bg-white/[0.04]' />

            <div className='text-center'>
              <h2 className='text-white text-2xl font-bold leading-snug'>
                Qualidade de vida no campo
                <br /> com tecnologia e eficiência.{' '}
              </h2>
            </div>

         
          </div>
        </div>

        <div className='flex-1 flex flex-col items-center justify-center min-h-screen bg-white px-6 py-10 sm:px-12'>
       

          <div className='w-full max-w-[380px]'>
            <div className='mb-7 fade-up'>
              <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>Bem-vindo</h1>
              <p className='text-gray-400 text-sm mt-1'>Faça login para acessar o painel</p>
            </div>

            <form className='flex flex-col gap-4 fade-up-d' onSubmit={handleSubmit(handleLogin)}>
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  E-mail
                </label>
                <input
                  className='w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200'
                  type='email'
                  placeholder='seu@email.com'
                  {...register('email')}
                />
                {errors?.email?.message && (
                  <p className='text-red-500 text-xs'>{errors.email.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <div className='flex items-center justify-between'>
                  <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Senha
                  </label>
                  <button
                    type='button'
                    className='text-xs text-blue-500 hover:underline'
                    onClick={() => {
                      window.location.href = '/password/forgot';
                    }}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <div className='relative'>
                  <input
                    className='w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200'
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                    onClick={togglePasswordVisibility}
                  >
                   
                  </button>
                </div>
                {errors?.password?.message && (
                  <p className='text-red-500 text-xs'>{errors.password.message}</p>
                )}
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full py-2.5 mt-1 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300'
              >
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
        </div>
   

      {/* Modal: acesso não autorizado */}
      {showModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4'>
          <div className='bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm'>
            <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-5 h-5 text-red-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                />
              </svg>
            </div>
            <h2 className='text-base font-semibold text-gray-900 text-center'>
              Acesso não autorizado
            </h2>
            <p className='mt-2 text-gray-500 text-sm text-center leading-relaxed'>
              Você não tem permissão para acessar este sistema. Contate a BE1 Tecnologia para obter
              acesso.
            </p>
            <a
              href='mailto:be1@be1.com.br'
              className='text-blue-500 mt-3 block text-sm text-center hover:underline'
            >
              Entre em contato
            </a>
            <button
              className='mt-4 w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors'
              onClick={() => setShowModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showIncorrectModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4'>
          <div className='bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm'>
            <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-5 h-5 text-red-500'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <h2 className='text-base font-semibold text-gray-900 text-center'>Dados incorretos</h2>
            <p className='mt-2 text-gray-500 text-sm text-center leading-relaxed'>
              O e-mail ou senha estão incorretos. Verifique suas informações e tente novamente.
            </p>
            <button
              className='mt-4 w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors'
              onClick={() => setShowIncorrectModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
