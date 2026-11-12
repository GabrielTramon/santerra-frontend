'use client';

import { Funnel } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { type FilterDefinition, type FilterValues, getFilterKeys } from '@/lib/list-filters';
import { toHref } from '@/lib/list-params';

const ALL_OPTIONS = 'all';

type FilterFieldProps = {
  filter: FilterDefinition;
  values: FilterValues;
  onChange: (key: string, value: string) => void;
};

function FilterField({ filter, values, onChange }: FilterFieldProps) {
  if (filter.type === 'select') {
    const id = `filter-${filter.key}`;

    return (
      <Field>
        <FieldLabel htmlFor={id}>{filter.label}</FieldLabel>
        <Select
          value={values[filter.key] || ALL_OPTIONS}
          onValueChange={(value) => onChange(filter.key, value === ALL_OPTIONS ? '' : value)}
        >
          <SelectTrigger id={id} className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position='popper'>
            <SelectItem value={ALL_OPTIONS}>Todos</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  }

  if (filter.type === 'dateRange') {
    const from = values[filter.fromKey];
    const to = values[filter.toKey];

    return (
      <FieldSet className='gap-0'>
        <FieldLegend variant='label'>{filter.label}</FieldLegend>
        <div className='grid grid-cols-2 gap-2'>
          <Field className='gap-1.5'>
            <FieldLabel
              htmlFor={`filter-${filter.fromKey}`}
              className='text-xs text-muted-foreground'
            >
              De
            </FieldLabel>
            <Input
              id={`filter-${filter.fromKey}`}
              type='date'
              value={from}
              max={to || undefined}
              onChange={(event) => onChange(filter.fromKey, event.target.value)}
            />
          </Field>
          <Field className='gap-1.5'>
            <FieldLabel htmlFor={`filter-${filter.toKey}`} className='text-xs text-muted-foreground'>
              Até
            </FieldLabel>
            <Input
              id={`filter-${filter.toKey}`}
              type='date'
              value={to}
              min={from || undefined}
              onChange={(event) => onChange(filter.toKey, event.target.value)}
            />
          </Field>
        </div>
      </FieldSet>
    );
  }

  const { key, options } = filter;
  const selected = values[key].split(',');

  function toggle(value: string, checked: boolean) {
    const next = options
      .map((option) => option.value)
      .filter((option) => (option === value ? checked : selected.includes(option)));

    onChange(key, next.join(','));
  }

  return (
    <FieldSet className='gap-0'>
      <FieldLegend variant='label'>{filter.label}</FieldLegend>
      <FieldGroup data-slot='checkbox-group'>
        {options.map((option) => (
          <Field key={option.value} orientation='horizontal'>
            <Checkbox
              id={`filter-${key}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked === true)}
            />
            <FieldLabel htmlFor={`filter-${key}-${option.value}`} className='font-normal'>
              {option.label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

type ListFiltersProps = {
  filters: FilterDefinition[];
  values: FilterValues;
};

export function ListFilters({ filters, values }: ListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const [isPending, startTransition] = useTransition();
  const keys = getFilterKeys(filters);
  const activeCount = keys.reduce(
    (count, key) => count + values[key].split(',').filter(Boolean).length,
    0,
  );

  function emptyValues(): FilterValues {
    return Object.fromEntries(keys.map((key) => [key, '']));
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setDraft(values);
    }

    setIsOpen(open);
  }

  function setValue(key: string, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(nextValues: FilterValues) {
    const params = new URLSearchParams(searchParams);

    keys.forEach((key) => {
      if (nextValues[key]) {
        params.set(key, nextValues[key]);
      } else {
        params.delete(key);
      }
    });

    params.delete('page');
    setIsOpen(false);
    startTransition(() => router.push(toHref(pathname, params)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(draft);
  }

  function handleClear() {
    if (activeCount > 0) {
      applyFilters(emptyValues());
    } else {
      setDraft(emptyValues());
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant='secondary'>
          {isPending ? <Spinner /> : <Funnel className='fill-current' />}
          Filtros
          {activeCount > 0 && (
            <>
              <span
                aria-hidden='true'
                className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums'
              >
                {activeCount}
              </span>
              <span className='sr-only'>, {activeCount} ativos</span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-88 max-w-[calc(100vw-2rem)] gap-0 p-0'>
        <form noValidate onSubmit={handleSubmit}>
          <div className='border-b px-4 py-3'>
            <PopoverTitle>Filtros</PopoverTitle>
          </div>

          <div className='flex flex-col gap-5 p-4'>
            {filters.map((filter) => (
              <FilterField
                key={filter.type === 'dateRange' ? filter.fromKey : filter.key}
                filter={filter}
                values={draft}
                onChange={setValue}
              />
            ))}
          </div>

          <div className='flex justify-end gap-2 border-t px-4 py-3'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={handleClear}
              disabled={activeCount === 0 && Object.values(draft).every((value) => !value)}
            >
              Limpar
            </Button>
            <Button type='submit' size='sm'>
              Aplicar filtros
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
