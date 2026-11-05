import { Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { BackLink } from '@/components/layout/back-link';
import { PageHeader } from '@/components/layout/page-header';
import { apiRequest } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import type { Paginated } from '@/types/api';
import type { Potential } from '@/types/potential';

import PersonForm from '../person-form';
import { getCreatablePersonTypes } from '../person-types';

export const metadata: Metadata = {
  title: 'Nova pessoa',
};

export default async function NewPersonPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const personTypes = getCreatablePersonTypes(session.permissions);

  if (!session.permissions.includes('persons.create') || personTypes.length === 0) {
    notFound();
  }

  // O produtor precisa de um potencial; a lista vai inteira para o select (máximo da API: 100).
  const potentials = personTypes.includes('producer')
    ? await apiRequest<Paginated<Potential>>('/potentials?limit=100', {
        token: session.accessToken,
      })
    : null;

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <BackLink href='/admin/persons'>Pessoas</BackLink>
      <PageHeader
        icon={Users}
        title='Nova pessoa'
        description='Escolha o tipo e preencha os dados para cadastrar uma pessoa.'
      />
      <PersonForm
        personTypes={personTypes}
        potentials={potentials?.data.map(({ id, name }) => ({ id, name })) ?? []}
      />
    </div>
  );
}
