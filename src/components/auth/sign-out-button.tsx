'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type='button'
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      className='rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
    >
      Sair
    </button>
  );
}
