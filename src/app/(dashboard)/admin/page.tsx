import type { Metadata } from 'next';

import { requireSession } from '@/lib/session';

import AccountOverview from './account-overview';
import WelcomeBanner from './welcome-banner';

export const metadata: Metadata = {
  title: 'Início',
};

export default async function AdminPage() {
  const session = await requireSession();
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
