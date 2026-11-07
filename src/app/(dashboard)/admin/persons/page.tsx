import { UserPlus, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/list/data-table';
import { ListEmptyState } from '@/components/list/list-empty-state';
import { ListFilters } from '@/components/list/list-filters';
import { ListPagination } from '@/components/list/list-pagination';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import {
  formatDate,
  formatNationalId,
  formatPhone,
  normalizeDocumentSearch,
} from '@/lib/format';
import { parseFilters, toApiFilters } from '@/lib/list-filters';
import { buildApiListQuery, buildListHref, parseListParams } from '@/lib/list-params';
import { hasPermission, requireSession } from '@/lib/session';
import type { Paginated } from '@/types/api';
import type { Person } from '@/types/person';

import { getCreatablePersonTypes } from './person-types';
import { PERSON_DELETE_TEXTS, PERSON_EMPTY_TEXTS, PERSON_FILTERS } from './persons-config';

export const metadata: Metadata = {
  title: 'Pessoas',
};

type PersonsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PersonsPage({ searchParams }: PersonsPageProps) {
  const session = await requireSession('persons.read');
  const params = await searchParams;
  const { page, pageSize, search: searchTerm } = parseListParams(params);
  const filters = parseFilters(params, PERSON_FILTERS);
  const listQuery = { search: searchTerm, ...filters };
  const query = buildApiListQuery(
    { page, pageSize, search: normalizeDocumentSearch(searchTerm) },
    toApiFilters(filters, PERSON_FILTERS),
  );

  const persons = await apiRequest<Paginated<Person>>(`/persons?${query}`, {
    token: session.accessToken,
  });

  if (persons.meta.totalPages > 0 && page > persons.meta.totalPages) {
    redirect(buildListHref('/admin/persons', listQuery, persons.meta.totalPages, pageSize));
  }

  const canCreate =
    hasPermission(session, 'persons.create') &&
    getCreatablePersonTypes(session.permissions).length > 0;
  const canDelete = hasPermission(session, 'persons.delete');
  const createAction = canCreate && (
    <Button href='/admin/persons/new'>
      <UserPlus />
      Nova pessoa
    </Button>
  );

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon={Users}
        title='Pessoas'
        description='Consulte e gerencie as pessoas cadastradas na sua empresa.'
        actions={createAction}
        searchPlaceholder='Buscar por nome ou CPF/CNPJ'
        filters={<ListFilters filters={PERSON_FILTERS} values={filters} />}
      />

      <DataTable
        rows={persons.data}
        rowHref={(person) => `/admin/persons/${person.id}`}
        primary={{
          header: 'Pessoa',
          title: (person) => person.name,
          subtitle: (person) => person.email ?? 'E-mail não informado',
          avatar: true,
        }}
        columns={[
          {
            header: 'CPF/CNPJ',
            visibleFrom: 'sm',
            cell: (person) => (person.nationalId ? formatNationalId(person.nationalId) : '—'),
          },
          {
            header: 'Telefone',
            visibleFrom: 'md',
            cell: (person) => (person.phoneNumber ? formatPhone(person.phoneNumber) : '—'),
          },
          { header: 'Cadastro', visibleFrom: 'lg', cell: (person) => formatDate(person.createdAt) },
        ]}
        actions={{
          canUpdate: hasPermission(session, 'persons.update'),
          deleteDialog: canDelete
            ? (person) => ({
                ...PERSON_DELETE_TEXTS,
                recordName: person.name,
                deletePath: `/persons/${person.id}`,
              })
            : undefined,
        }}
        emptyState={
          <ListEmptyState
            icon={Users}
            pathname='/admin/persons'
            searchTerm={searchTerm}
            hasFilters={Object.values(filters).some(Boolean)}
            createAction={createAction}
            texts={PERSON_EMPTY_TEXTS}
          />
        }
        footer={<ListPagination pathname='/admin/persons' query={listQuery} meta={persons.meta} />}
      />
    </div>
  );
}
