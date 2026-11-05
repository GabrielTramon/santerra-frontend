import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authOptions } from '@/lib/auth';

// Gravado pelo SidebarProvider (components/ui/sidebar.tsx) ao abrir ou recolher o menu.
const SIDEBAR_COOKIE_NAME = 'sidebar_state';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const cookieStore = await cookies();
  const companyName = session.company?.name ?? '';

  return (
    <SidebarProvider defaultOpen={cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== 'false'}>
      <AppSidebar companyName={companyName} permissions={session.permissions} />
      <SidebarInset>
        <AppHeader
          userName={session.user.name}
          email={session.user.email}
          companyName={companyName}
          canSwitchCompany={session.companies.length > 1}
        />
        <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col p-4 sm:p-6 lg:p-8'>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
