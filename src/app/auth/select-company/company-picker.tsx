'use client';

import type { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { AuthHeader } from '@/components/auth/auth-header';
import { Alert } from '@/components/ui/alert';
import { BuildingIcon, ChevronRightIcon } from '@/components/ui/icons';
import { Spinner } from '@/components/ui/spinner';

type CompanyPickerProps = {
  userName: string;
  companies: Session['companies'];
  currentCompanyId: string | null;
  callbackUrl: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export default function CompanyPicker({
  userName,
  companies,
  currentCompanyId,
  callbackUrl,
}: CompanyPickerProps) {
  const { update } = useSession();
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firstName] = userName.split(' ');

  async function selectCompany(companyId: string) {
    setErrorMessage(null);
    setSelectingId(companyId);

    const session = await update({ companyId });

    if (session?.company?.id !== companyId) {
      setSelectingId(null);
      setErrorMessage('Não foi possível acessar esta empresa. Tente novamente.');
      return;
    }

    window.location.assign(callbackUrl);
  }

  return (
    <>
      <AuthHeader
        icon={<BuildingIcon className='size-7' />}
        title='Escolha a empresa'
        description={`Olá, ${firstName}! Sua conta tem acesso a mais de uma empresa. Qual você quer acessar agora?`}
      />

      <div className='flex flex-col gap-4 animate-fade-up [animation-delay:80ms]'>
        {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

        <ul className='flex flex-col gap-3'>
          {companies.map((company) => (
            <li key={company.id}>
              <button
                type='button'
                disabled={selectingId !== null}
                onClick={() => selectCompany(company.id)}
                className='group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-600/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 disabled:pointer-events-none disabled:opacity-60'
              >
                <span className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-400 to-brand-600 text-base font-bold text-white shadow-md shadow-brand-600/20'>
                  {getInitials(company.name)}
                </span>

                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[15px] font-semibold text-slate-900'>
                    {company.name}
                  </span>
                  {company.id === currentCompanyId && (
                    <span className='text-xs font-semibold text-brand-600'>Empresa atual</span>
                  )}
                </span>

                {selectingId === company.id ? (
                  <Spinner className='size-5 text-brand-600' />
                ) : (
                  <ChevronRightIcon className='size-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600' />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type='button'
        onClick={() => signOut({ callbackUrl: '/auth/login' })}
        className='mx-auto mt-8 block rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 transition hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40'
      >
        Entrar com outra conta
      </button>
    </>
  );
}
