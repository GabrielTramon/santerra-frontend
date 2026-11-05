import { UserPlus, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { PageHeader } from '@/components/layout/page-header';
import { ListPagination } from '@/components/list/list-pagination';
import { buttonVariants } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { onlyDigits, toDayBoundary } from '@/lib/format';
import { buildListHref, parseListParams } from '@/lib/list-params';
import type { Paginated } from '@/types/api';
import type { Person } from '@/types/person';

import { getCreatablePersonTypes } from './person-types';
import PersonsFilters from './persons-filters';
import { parsePersonFilters } from './persons-search-params';
import PersonsTable from './persons-table';

export const metadata: Metadata = {
  title: 'Pessoas',
};

type PersonsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PersonsPage({ searchParams }: PersonsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (!session.permissions.includes('persons.read')) {
    notFound();
  }

  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parsePersonFilters(params);
  // Tudo o que a URL guarda além de página e tamanho: os links da paginação preservam.
  const listQuery = { search: searchTerm, ...filters };
  const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
  // O documento é salvo só com dígitos, então "123.456.789-00" vira "12345678900" na busca.
  const apiSearchTerm = /^[\d\s./-]+$/.test(searchTerm) ? onlyDigits(searchTerm) : searchTerm;

  if (apiSearchTerm) {
    query.set('search', apiSearchTerm);
  }

  if (filters.type) {
    query.set('type', filters.type);
  }

  if (filters.createdFrom) {
    query.set('createdFrom', toDayBoundary(filters.createdFrom, 'start'));
  }

  if (filters.createdTo) {
    query.set('createdTo', toDayBoundary(filters.createdTo, 'end'));
  }

  if (filters.missing) {
    query.set('missing', filters.missing);
  }

  const persons = await apiRequest<Paginated<Person>>(`/persons?${query}`, {
    token: session.accessToken,
  });

  if (persons.meta.totalPages > 0 && page > persons.meta.totalPages) {
    redirect(buildListHref('/admin/persons', listQuery, persons.meta.totalPages, pageSize));
  }

  // Toda pessoa nasce com um tipo, então criar também depende de poder criar algum vínculo.
  const canCreate =
    session.permissions.includes('persons.create') &&
    getCreatablePersonTypes(session.permissions).length > 0;
  const canUpdate = session.permissions.includes('persons.update');
  const canDelete = session.permissions.includes('persons.delete');

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Users}
        title='Pessoas'
        description='Consulte e gerencie as pessoas cadastradas na sua empresa.'
        actions={
          canCreate && (
            <Link href='/admin/persons/new' className={buttonVariants()}>
              <UserPlus />
              Nova pessoa
            </Link>
          )
        }
        searchPlaceholder='Buscar por nome ou CPF/CNPJ'
        filters={<PersonsFilters values={filters} />}
      />

      <PersonsTable
        persons={persons.data}
        searchTerm={searchTerm}
        hasFilters={Object.values(filters).some(Boolean)}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        footer={<ListPagination pathname='/admin/persons' query={listQuery} meta={persons.meta} />}
      />
    </div>
  );
}
