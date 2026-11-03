import { getServerSession } from 'next-auth';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { authOptions } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className='min-h-screen bg-brand-50/40'>
      <header className='flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4'>
        <div>
          <h1 className='text-lg font-bold text-slate-900'>Admin Dashboard</h1>
          {session && (
            <p className='text-sm text-slate-500'>
              {session.user.name} · {session.company?.name}
            </p>
          )}
        </div>
        <SignOutButton />
      </header>
    </div>
  );
}
