'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

import { TableRow } from '@/components/ui/table';
import { cn } from '@/lib/cn';

type TableRowLinkProps = ComponentProps<typeof TableRow> & {
  href: string;
};

// Linha inteira clicável. Para teclado e leitores de tela, a linha deve ter um <Link> próprio
// (normalmente no nome), que trata o clique sozinho. Botões e links da linha (como o menu de
// ações) não disparam a navegação.
export function TableRowLink({ href, className, ...props }: TableRowLinkProps) {
  const router = useRouter();

  function shouldIgnore(event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target as HTMLElement;

    return (
      // Cliques em portais (menu de ações, diálogo) sobem pela árvore do React até a linha.
      !event.currentTarget.contains(target) ||
      target.closest('a, button, input') !== null ||
      Boolean(window.getSelection()?.toString())
    );
  }

  function handleClick(event: MouseEvent<HTMLTableRowElement>) {
    if (shouldIgnore(event)) {
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      window.open(href, '_blank');
      return;
    }

    router.push(href);
  }

  function handleAuxClick(event: MouseEvent<HTMLTableRowElement>) {
    if (event.button === 1 && !shouldIgnore(event)) {
      window.open(href, '_blank');
    }
  }

  return (
    <TableRow
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      className={cn('cursor-pointer', className)}
      {...props}
    />
  );
}
