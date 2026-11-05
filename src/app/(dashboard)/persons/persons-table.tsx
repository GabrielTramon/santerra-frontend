import { SearchX, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { TableRowLink } from '@/components/list/table-row-link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatNationalId, formatPhone } from '@/lib/format';
import { getInitials } from '@/lib/initials';
import type { Person } from '@/types/person';

import PersonRowActions from './person-row-actions';

type PersonsTableProps = {
  persons: Person[];
  searchTerm: string;
  hasFilters: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  // Rodapé do card da tabela: a paginação.
  footer?: ReactNode;
};

function getClearLabel(searchTerm: string, hasFilters: boolean): string {
  if (searchTerm && hasFilters) {
    return 'Limpar busca e filtros';
  }

  return searchTerm ? 'Limpar busca' : 'Limpar filtros';
}

export default function PersonsTable({
  persons,
  searchTerm,
  hasFilters,
  canCreate,
  canUpdate,
  canDelete,
  footer,
}: PersonsTableProps) {
  if (persons.length === 0) {
    return searchTerm || hasFilters ? (
      <Empty className='border bg-card animate-fade-up [animation-delay:80ms]'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Nenhuma pessoa encontrada</EmptyTitle>
          <EmptyDescription>
            {searchTerm
              ? `Não encontramos resultados para “${searchTerm}”${hasFilters ? ' com os filtros aplicados' : ''}. Confira a grafia ou busque pelo documento.`
              : 'Nenhuma pessoa corresponde aos filtros aplicados. Ajuste ou limpe os filtros.'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href='/persons' className={buttonVariants({ variant: 'outline' })}>
            {getClearLabel(searchTerm, hasFilters)}
          </Link>
        </EmptyContent>
      </Empty>
    ) : (
      <Empty className='border bg-card animate-fade-up [animation-delay:80ms]'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Users />
          </EmptyMedia>
          <EmptyTitle>Nenhuma pessoa cadastrada</EmptyTitle>
          <EmptyDescription>
            {canCreate
              ? 'Cadastre a primeira pessoa para começar.'
              : 'Quando houver pessoas cadastradas, elas aparecerão aqui.'}
          </EmptyDescription>
        </EmptyHeader>
        {canCreate && (
          <EmptyContent>
            <Link href='/persons/new' className={buttonVariants()}>
              <UserPlus />
              Nova pessoa
            </Link>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border bg-card animate-fade-up [animation-delay:80ms]'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='px-4 text-muted-foreground'>Pessoa</TableHead>
            <TableHead className='hidden px-4 text-muted-foreground sm:table-cell'>
              CPF/CNPJ
            </TableHead>
            <TableHead className='hidden px-4 text-muted-foreground md:table-cell'>
              Telefone
            </TableHead>
            <TableHead className='hidden px-4 text-muted-foreground lg:table-cell'>
              Cadastro
            </TableHead>
            <TableHead className='w-20 px-4 text-center text-muted-foreground'>Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {persons.map((person) => (
            <TableRowLink key={person.id} href={`/persons/${person.id}`}>
              <TableCell className='w-full max-w-0 px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <Avatar className='size-9'>
                    <AvatarFallback className='bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300'>
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <Link
                      href={`/persons/${person.id}`}
                      className='block truncate rounded-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'
                    >
                      {person.name}
                    </Link>
                    <p className='truncate text-xs text-muted-foreground'>
                      {person.email ?? 'E-mail não informado'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className='hidden px-4 py-3 text-muted-foreground tabular-nums sm:table-cell'>
                {person.nationalId ? formatNationalId(person.nationalId) : '—'}
              </TableCell>
              <TableCell className='hidden px-4 py-3 text-muted-foreground tabular-nums md:table-cell'>
                {person.phoneNumber ? formatPhone(person.phoneNumber) : '—'}
              </TableCell>
              <TableCell className='hidden px-4 py-3 text-muted-foreground tabular-nums lg:table-cell'>
                {formatDate(person.createdAt)}
              </TableCell>
              <TableCell className='px-4 py-2 text-center'>
                <PersonRowActions
                  personId={person.id}
                  personName={person.name}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
              </TableCell>
            </TableRowLink>
          ))}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}
