'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { AuthHeader } from '@/components/auth/auth-header';
import { AuthSwitchLink } from '@/components/auth/auth-switch-link';
import { buttonStyles } from '@/components/ui/button';
import { CheckCircleIcon } from '@/components/ui/icons';
import { ApiError, apiRequest } from '@/lib/api';
import { DEFAULT_CALLBACK_URL } from '@/lib/callback-url';

import { AccountStep, type AccountValues } from './account-step';
import { CompanyStep, type CompanyValues } from './company-step';
import { PasswordStep, type PasswordValues } from './password-step';
import { type SignUpStep, SignUpStepper } from './sign-up-stepper';
import { VerificationStep } from './verification-step';

const EMAIL_NOT_VERIFIED_CODE = 'EMAIL_NOT_VERIFIED';

type SentCode = {
  email: string;
  sentAt: number;
};

type EmailVerification = {
  email: string;
  token: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export default function SignUpForm() {
  const [step, setStep] = useState<SignUpStep>('account');
  const [account, setAccount] = useState<AccountValues>({ name: '', email: '' });
  const [passwords, setPasswords] = useState<PasswordValues>({
    password: '',
    passwordConfirmation: '',
  });
  const [company, setCompany] = useState<CompanyValues>({ companyName: '' });
  const [sentCode, setSentCode] = useState<SentCode | null>(null);
  const [verification, setVerification] = useState<EmailVerification | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [createdCompanyName, setCreatedCompanyName] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isEmailVerified = verification?.email === account.email;

  function goTo(nextStep: SignUpStep) {
    setStepError(null);
    setStep(nextStep);
  }

  function returnToAccountWithEmailError(message: string) {
    setEmailError(message);
    setSentCode(null);
    setVerification(null);
    goTo('account');
  }

  function handleAccountSubmit(values: AccountValues) {
    setAccount(values);
    setEmailError(null);
    goTo('password');
  }

  async function handlePasswordSubmit(values: PasswordValues) {
    setPasswords(values);

    if (isEmailVerified) {
      goTo('company');
      return;
    }

    if (sentCode?.email === account.email) {
      goTo('verification');
      return;
    }

    try {
      await apiRequest<void>('/auth/sign-up/verification-code', {
        method: 'POST',
        body: { email: account.email },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        returnToAccountWithEmailError(error.message);
        return;
      }

      if (!(error instanceof ApiError && error.status === 429)) {
        setStepError(
          getErrorMessage(error, 'Não foi possível enviar o código agora. Tente novamente.'),
        );
        return;
      }
    }

    setSentCode({ email: account.email, sentAt: Date.now() });
    setVerificationNotice(null);
    goTo('verification');
  }

  function handleVerified(token: string) {
    setVerification({ email: account.email, token });
    setVerificationNotice(null);
    goTo('company');
  }

  async function handleCompanySubmit(values: CompanyValues) {
    setCompany(values);
    setStepError(null);

    try {
      await apiRequest<unknown>('/auth/sign-up', {
        method: 'POST',
        body: {
          ...account,
          password: passwords.password,
          companyName: values.companyName,
          verificationToken: verification?.token ?? '',
        },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        returnToAccountWithEmailError(error.message);
        return;
      }

      if (error instanceof ApiError && error.code === EMAIL_NOT_VERIFIED_CODE) {
        setVerification(null);
        setVerificationNotice(error.message);
        goTo('verification');
        return;
      }

      setStepError(
        getErrorMessage(error, 'Não foi possível criar sua conta agora. Tente novamente em instantes.'),
      );
      return;
    }

    const result = await signIn('credentials', {
      email: account.email,
      password: passwords.password,
      redirect: false,
    });

    if (!result?.ok || result.error) {
      setCreatedCompanyName(values.companyName);
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
      <SignUpStepper currentStep={step} />

      <div key={step}>
        {step === 'account' && (
          <AccountStep
            defaultValues={account}
            emailError={emailError}
            onSubmit={handleAccountSubmit}
          />
        )}

        {step === 'password' && (
          <PasswordStep
            email={account.email}
            defaultValues={passwords}
            error={stepError}
            onBack={(values) => {
              setPasswords(values);
              goTo('account');
            }}
            onSubmit={handlePasswordSubmit}
          />
        )}

        {step === 'verification' && (
          <VerificationStep
            email={account.email}
            codeSentAt={sentCode?.email === account.email ? sentCode.sentAt : null}
            isVerified={isEmailVerified}
            notice={verificationNotice}
            onCodeSent={(sentAt) => setSentCode({ email: account.email, sentAt })}
            onVerified={handleVerified}
            onChangeEmail={() => goTo('account')}
            onBack={() => goTo('password')}
            onContinue={() => goTo('company')}
          />
        )}

        {step === 'company' && (
          <CompanyStep
            name={account.name}
            email={account.email}
            defaultValues={company}
            error={stepError}
            isRedirecting={isRedirecting}
            onBack={(values) => {
              setCompany(values);
              goTo('verification');
            }}
            onSubmit={handleCompanySubmit}
          />
        )}
      </div>

      {step === 'account' && (
        <AuthSwitchLink question='Já tem uma conta?' href='/auth/login' label='Entrar' />
      )}
    </>
  );
}
