import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import AccountOverview from './account-overview';
import WelcomeBanner from './welcome-banner';

export const metadata: Metadata = {
  title: 'Início',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const [firstName] = session.user.name.split(' ');

  return (
    <div className='flex flex-col gap-6'>
      <WelcomeBanner firstName={firstName} />
      <AccountOverview
        userName={session.user.name}
        email={session.user.email}
        companyName={session.company?.name ?? ''}
        companyCount={session.companies.length}
      />
    </div>
  );
}
