import { getSearchParam, isIsoDate, type SearchParams } from '@/lib/list-params';

export const PERSON_TYPE_OPTIONS = [
  { value: 'employee', label: 'Funcionários' },
  { value: 'producer', label: 'Produtores' },
];

export const PERSON_MISSING_FIELD_OPTIONS = [
  { value: 'nationalId', label: 'Sem CPF/CNPJ' },
  { value: 'phoneNumber', label: 'Sem telefone' },
  { value: 'email', label: 'Sem e-mail' },
];

// Como na URL: datas "AAAA-MM-DD" e `missing` separado por vírgula. Vazio = sem filtro.
export type PersonFilters = {
  type: string;
  createdFrom: string;
  createdTo: string;
  missing: string;
};

// Valor inválido na URL (link editado à mão) é ignorado: a API responderia 400.
export function parsePersonFilters(searchParams: SearchParams): PersonFilters {
  const type = getSearchParam(searchParams, 'type');
  const createdFrom = getSearchParam(searchParams, 'createdFrom');
  const createdTo = getSearchParam(searchParams, 'createdTo');
  const missing = getSearchParam(searchParams, 'missing').split(',');

  return {
    type: PERSON_TYPE_OPTIONS.some((option) => option.value === type) ? type : '',
    createdFrom: isIsoDate(createdFrom) ? createdFrom : '',
    createdTo: isIsoDate(createdTo) ? createdTo : '',
    missing: PERSON_MISSING_FIELD_OPTIONS.filter((option) => missing.includes(option.value))
      .map((option) => option.value)
      .join(','),
  };
}
