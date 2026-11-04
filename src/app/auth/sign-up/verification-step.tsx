'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { CodeInput } from '@/components/ui/code-input';
import { CheckCircleIcon, MailIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';
import { ApiError, apiRequest } from '@/lib/api';

import { StepActions } from './step-actions';

const CODE_LENGTH = 6;
const RESEND_INTERVAL_IN_SECONDS = 60;
const MILLISECONDS_PER_SECOND = 1000;
const CODE_ERROR_ID = 'verification-code-error';

type VerifyEmailResponse = {
  verificationToken: string;
};

type VerificationStepProps = {
  email: string;
  codeSentAt: number | null;
  isVerified: boolean;
  notice: string | null;
  onCodeSent: (sentAt: number) => void;
  onVerified: (verificationToken: string) => void;
  onChangeEmail: () => void;
  onBack: () => void;
  onContinue: () => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

function getSecondsUntilResend(codeSentAt: number | null, now: number): number {
  if (codeSentAt === null) {
    return 0;
  }

  const resendAt = codeSentAt + RESEND_INTERVAL_IN_SECONDS * MILLISECONDS_PER_SECOND;

  return Math.max(0, Math.ceil((resendAt - now) / MILLISECONDS_PER_SECOND));
}

const linkButtonClassName =
  'rounded font-semibold text-brand-600 transition hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-60';

export function VerificationStep({
  email,
  codeSentAt,
  isVerified,
  notice,
  onCodeSent,
  onVerified,
  onChangeEmail,
  onBack,
  onContinue,
}: VerificationStepProps) {
  const codeInputRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ variant: 'info' | 'success'; text: string } | null>(
    notice ? { variant: 'info', text: notice } : null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const secondsUntilResend = getSecondsUntilResend(codeSentAt, now);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), MILLISECONDS_PER_SECOND);

    return () => window.clearInterval(intervalId);
  }, []);

  async function verifyCode(value: string) {
    if (value.length !== CODE_LENGTH || isVerifying) {
      return;
    }

    setIsVerifying(true);
    setCodeError(null);
    setMessage(null);

    try {
      const { verificationToken } = await apiRequest<VerifyEmailResponse>(
        '/auth/sign-up/verify-email',
        { method: 'POST', body: { email, code: value } },
      );

      onVerified(verificationToken);
    } catch (error) {
      setCodeError(
        getErrorMessage(error, 'Não foi possível confirmar o código agora. Tente novamente.'),
      );
      setCode('');
      setIsVerifying(false);
      codeInputRef.current?.querySelector('input')?.focus();
    }
  }

  async function resendCode() {
    setIsResending(true);
    setCodeError(null);
    setMessage(null);

    try {
      await apiRequest<void>('/auth/sign-up/verification-code', {
        method: 'POST',
        body: { email },
      });

      const sentAt = Date.now();

      onCodeSent(sentAt);
      setNow(sentAt);
      setCode('');
      setMessage({ variant: 'success', text: 'Enviamos um novo código para o seu e-mail.' });
      codeInputRef.current?.querySelector('input')?.focus();
    } catch (error) {
      setMessage(null);
      setCodeError(
        getErrorMessage(error, 'Não foi possível reenviar o código agora. Tente novamente.'),
      );
    } finally {
      setIsResending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verifyCode(code);
  }

  if (isVerified) {
    return (
      <>
        <AuthHeader
          icon={<CheckCircleIcon className='size-7' />}
          title='E-mail confirmado'
          description={
            <>
              O e-mail <strong className='font-semibold text-slate-700'>{email}</strong> já foi
              confirmado. Agora falta só a sua empresa.
            </>
          }
        />

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onContinue();
          }}
          className='flex flex-col animate-fade-up [animation-delay:80ms]'
        >
          <StepActions submitLabel='Continuar' onBack={onBack} />
        </form>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        icon={<MailIcon className='size-7' />}
        title='Confirme seu e-mail'
        description={
          <>
            Enviamos um código de {CODE_LENGTH} dígitos para{' '}
            <strong className='font-semibold text-slate-700'>{email}</strong>. Digite-o abaixo para
            continuar.
          </>
        }
      />

      <form
        noValidate
        onSubmit={handleSubmit}
        className='flex flex-col gap-5 animate-fade-up [animation-delay:80ms]'
      >
        {message && <Alert variant={message.variant}>{message.text}</Alert>}

        <div className='flex flex-col gap-2'>
          <span className='text-sm font-semibold text-slate-700'>Código de verificação</span>

          <CodeInput
            ref={codeInputRef}
            label='Código de verificação'
            length={CODE_LENGTH}
            value={code}
            onChange={(value) => {
              setCode(value);
              setCodeError(null);
            }}
            onComplete={(value) => void verifyCode(value)}
            invalid={Boolean(codeError)}
            readOnly={isVerifying}
            autoFocus
            describedBy={codeError ? CODE_ERROR_ID : undefined}
          />

          {codeError && (
            <p id={CODE_ERROR_ID} role='alert' className='text-[13px] font-medium text-red-600'>
              {codeError}
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-slate-500'>
          <span className='flex items-center gap-1.5'>
            Não recebeu?
            {isResending ? (
              <span className='flex items-center gap-1.5 font-semibold text-brand-600'>
                <Spinner />
                Reenviando...
              </span>
            ) : secondsUntilResend > 0 ? (
              <span className='font-medium tabular-nums text-slate-400'>
                Reenviar em {secondsUntilResend}s
              </span>
            ) : (
              <button
                type='button'
                onClick={() => void resendCode()}
                disabled={isVerifying}
                className={linkButtonClassName}
              >
                Reenviar código
              </button>
            )}
          </span>

          <button
            type='button'
            onClick={onChangeEmail}
            disabled={isVerifying}
            className={linkButtonClassName}
          >
            Alterar e-mail
          </button>
        </div>

        <StepActions
          submitLabel='Confirmar e-mail'
          onBack={onBack}
          loading={isVerifying}
          loadingText='Confirmando...'
          disabled={code.length !== CODE_LENGTH}
        />

        <p className='text-center text-[13px] text-slate-400'>
          O código expira em 15 minutos. Confira também a caixa de spam.
        </p>
      </form>
    </>
  );
}
