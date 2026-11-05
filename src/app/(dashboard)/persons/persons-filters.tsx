'use client';

import { ListFilters } from '@/components/list/list-filters';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  PERSON_MISSING_FIELD_OPTIONS,
  PERSON_TYPE_OPTIONS,
  type PersonFilters,
} from './persons-search-params';

// O Radix Select não aceita item com valor vazio.
const ALL_TYPES = 'all';

type PersonsFilterFieldsProps = {
  values: PersonFilters;
  onChange: (key: keyof PersonFilters, value: string) => void;
};

function PersonsFilterFields({ values, onChange }: PersonsFilterFieldsProps) {
  const missing = values.missing.split(',');

  function toggleMissing(field: string, checked: boolean) {
    const next = PERSON_MISSING_FIELD_OPTIONS.map((option) => option.value).filter((value) =>
      value === field ? checked : missing.includes(value),
    );

    onChange('missing', next.join(','));
  }

  return (
    <>
      <Field>
        <FieldLabel htmlFor='persons-filter-type'>Tipo</FieldLabel>
        <Select
          value={values.type || ALL_TYPES}
          onValueChange={(type) => onChange('type', type === ALL_TYPES ? '' : type)}
        >
          <SelectTrigger id='persons-filter-type' className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value={ALL_TYPES}>Todos</SelectItem>
            {PERSON_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <FieldSet className='gap-0'>
        <FieldLegend variant='label'>Data de cadastro</FieldLegend>
        <div className='grid grid-cols-2 gap-2'>
          <Field className='gap-1.5'>
            <FieldLabel htmlFor='persons-filter-created-from' className='text-xs text-muted-foreground'>
              De
            </FieldLabel>
            <Input
              id='persons-filter-created-from'
              type='date'
              value={values.createdFrom}
              max={values.createdTo || undefined}
              onChange={(event) => onChange('createdFrom', event.target.value)}
            />
          </Field>
          <Field className='gap-1.5'>
            <FieldLabel htmlFor='persons-filter-created-to' className='text-xs text-muted-foreground'>
              Até
            </FieldLabel>
            <Input
              id='persons-filter-created-to'
              type='date'
              value={values.createdTo}
              min={values.createdFrom || undefined}
              onChange={(event) => onChange('createdTo', event.target.value)}
            />
          </Field>
        </div>
      </FieldSet>

      <FieldSet className='gap-0'>
        <FieldLegend variant='label'>Dados faltando</FieldLegend>
        <FieldGroup data-slot='checkbox-group'>
          {PERSON_MISSING_FIELD_OPTIONS.map((option) => (
            <Field key={option.value} orientation='horizontal'>
              <Checkbox
                id={`persons-filter-missing-${option.value}`}
                checked={missing.includes(option.value)}
                onCheckedChange={(checked) => toggleMissing(option.value, checked === true)}
              />
              <FieldLabel htmlFor={`persons-filter-missing-${option.value}`} className='font-normal'>
                {option.label}
              </FieldLabel>
            </Field>
          ))}
        </FieldGroup>
      </FieldSet>
    </>
  );
}

type PersonsFiltersProps = {
  values: PersonFilters;
};

export default function PersonsFilters({ values }: PersonsFiltersProps) {
  return (
    <ListFilters values={values}>
      {(values, setValue) => <PersonsFilterFields values={values} onChange={setValue} />}
    </ListFilters>
  );
}
