'use client';

import { Funnel } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, type ReactNode, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { toHref } from '@/lib/list-params';

type FilterValues<K extends string> = Record<K, string>;

function emptyFilters<K extends string>(keys: K[]) {
  return Object.fromEntries(keys.map((key) => [key, ''])) as FilterValues<K>;
}

type ListFiltersProps<K extends string> = {
  // Filtros aplicados, já validados pela página: o que a API recebeu.
  values: FilterValues<K>;
  children: (values: FilterValues<K>, setValue: (key: K, value: string) => void) => ReactNode;
};

// Os campos editam um rascunho; "Aplicar" grava os filtros na URL e volta para a página 1.
export function ListFilters<K extends string>({ values, children }: ListFiltersProps<K>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const [isPending, startTransition] = useTransition();
  const keys = Object.keys(values) as K[];
  // Valor com vírgula (?missing=email,phoneNumber) conta um filtro por item.
  const activeCount = keys.reduce(
    (count, key) => count + values[key].split(',').filter(Boolean).length,
    0,
  );

  function handleOpenChange(open: boolean) {
    // Ao reabrir, o rascunho não aplicado é descartado.
    if (open) {
      setDraft(values);
    }

    setIsOpen(open);
  }

  function setValue(key: K, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(nextValues: FilterValues<K>) {
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
      applyFilters(emptyFilters(keys));
    } else {
      setDraft(emptyFilters(keys));
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

          <div className='flex flex-col gap-5 p-4'>{children(draft, setValue)}</div>

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
