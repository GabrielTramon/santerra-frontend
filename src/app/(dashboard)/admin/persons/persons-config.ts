import type { DeleteDialogTexts } from '@/components/crud/confirm-delete-dialog';
import type { ListEmptyStateTexts } from '@/components/list/list-empty-state';
import type { FilterDefinition } from '@/lib/list-filters';

export const PERSON_FILTERS: FilterDefinition[] = [
  {
    type: 'select',
    key: 'type',
    label: 'Tipo',
    options: [
      { value: 'employee', label: 'Funcionários' },
      { value: 'producer', label: 'Produtores' },
    ],
  },
  { type: 'dateRange', label: 'Data de cadastro', fromKey: 'createdFrom', toKey: 'createdTo' },
  {
    type: 'checkboxes',
    key: 'missing',
    label: 'Dados faltando',
    options: [
      { value: 'nationalId', label: 'Sem CPF/CNPJ' },
      { value: 'phoneNumber', label: 'Sem telefone' },
      { value: 'email', label: 'Sem e-mail' },
    ],
  },
];

export const PERSON_EMPTY_TEXTS: ListEmptyStateTexts = {
  notFoundTitle: 'Nenhuma pessoa encontrada',
  filtersDescription: 'Nenhuma pessoa corresponde aos filtros aplicados.',
  searchHint: 'Confira a grafia ou busque pelo documento.',
  emptyTitle: 'Nenhuma pessoa cadastrada',
  emptyDescription: 'Cadastre a primeira pessoa para começar.',
  emptyReadOnlyDescription: 'Quando houver pessoas cadastradas, elas aparecerão aqui.',
};

export const PERSON_DELETE_TEXTS: DeleteDialogTexts = {
  description:
    'A pessoa sai da lista e não poderá mais ser usada nos cadastros. Esta ação não pode ser desfeita.',
  confirmLabel: 'Excluir pessoa',
  successMessage: 'Pessoa excluída.',
  errorMessage: 'Não foi possível excluir a pessoa. Tente novamente.',
};
