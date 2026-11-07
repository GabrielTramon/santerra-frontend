import { Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate, formatNationalId, formatPhone } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Person } from '@/types/person';

import PersonForm from '../person-form';
import { PERSON_DELETE_TEXTS } from '../persons-config';

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

function getPerson(id: string, token: string): Promise<Person> {
  return getRecordOrNotFound<Person>(`/persons/${id}`, token);
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'persons.read')) {
    return { title: 'Pessoa' };
  }

  const { id } = await params;
  const person = await getPerson(id, session.accessToken);

  return { title: person.name };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const session = await requireSession('persons.read');
  const { id } = await params;
  const person = await getPerson(id, session.accessToken);
  const canUpdate = hasPermission(session, 'persons.update');
  const canDelete = hasPermission(session, 'persons.delete');

  return (
    <RecordPageLayout
      backHref='/admin/persons'
      backLabel='Pessoas'
      icon={Users}
      title={person.name}
      description={`Cadastro criado em ${formatDate(person.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...PERSON_DELETE_TEXTS}
            recordName={person.name}
            deletePath={`/persons/${person.id}`}
            listHref='/admin/persons'
          />
        )
      }
    >
      {canUpdate ? (
        <PersonForm person={person} />
      ) : (
        <RecordDetails
          title='Dados da pessoa'
          fields={[
            { label: 'Nome', value: person.name, wide: true },
            { label: 'CPF ou CNPJ', value: person.nationalId && formatNationalId(person.nationalId) },
            { label: 'Telefone', value: person.phoneNumber && formatPhone(person.phoneNumber) },
            { label: 'E-mail', value: person.email, wide: true },
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
