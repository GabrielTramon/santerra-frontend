import { Users } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { BackLink } from '@/components/layout/back-link';
import { PageHeader } from '@/components/layout/page-header';
import { apiRequest, isApiErrorWithStatus } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import type { Person } from '@/types/person';

import DeletePersonButton from '../delete-person-button';
import PersonDetails from '../person-details';
import PersonForm from '../person-form';

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

// generateMetadata e a página chamam com a mesma URL; o Next faz uma requisição só.
function getPerson(id: string, token: string): Promise<Person> {
  return apiRequest<Person>(`/persons/${id}`, { token }).catch((error: unknown) => {
    // 400 quando o id da URL nem é um UUID.
    if (isApiErrorWithStatus(error, 404) || isApiErrorWithStatus(error, 400)) {
      notFound();
    }

    throw error;
  });
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session?.permissions.includes('persons.read')) {
    return { title: 'Pessoa' };
  }

  const { id } = await params;
  const person = await getPerson(id, session.accessToken);

  return { title: person.name };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (!session.permissions.includes('persons.read')) {
    notFound();
  }

  const { id } = await params;
  const person = await getPerson(id, session.accessToken);
  const canUpdate = session.permissions.includes('persons.update');
  const canDelete = session.permissions.includes('persons.delete');

  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <BackLink href='/persons'>Pessoas</BackLink>
      <PageHeader
        icon={Users}
        title={person.name}
        description={`Cadastro criado em ${formatDate(person.createdAt, 'long')}`}
        actions={canDelete && <DeletePersonButton personId={person.id} personName={person.name} />}
      />
      {canUpdate ? <PersonForm person={person} /> : <PersonDetails person={person} />}
    </div>
  );
}
