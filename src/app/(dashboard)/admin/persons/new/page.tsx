import { Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { apiRequest } from '@/lib/api';
import { requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Potential } from '@/types/potential';

import PersonForm from '../person-form';
import { getCreatablePersonTypes } from '../person-types';

export const metadata: Metadata = {
  title: 'Nova pessoa',
};

export default async function NewPersonPage() {
  const session = await requireSession('persons.create');
  const personTypes = getCreatablePersonTypes(session.permissions);

  if (personTypes.length === 0) {
    notFound();
  }

  const potentials = personTypes.includes('producer')
    ? await apiRequest<Paginated<Potential>>('/potentials?limit=100', {
        token: session.accessToken,
      })
    : null;

  return (
    <RecordPageLayout
      backHref='/admin/persons'
      backLabel='Pessoas'
      icon={Users}
      title='Nova pessoa'
      description='Escolha o tipo e preencha os dados para cadastrar uma pessoa.'
    >
      <PersonForm
        personTypes={personTypes}
        potentials={potentials?.data.map(({ id, name }) => ({ id, name })) ?? []}
      />
    </RecordPageLayout>
  );
}
