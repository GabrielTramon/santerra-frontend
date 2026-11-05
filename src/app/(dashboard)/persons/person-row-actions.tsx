'use client';

import { Eye, Menu, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import DeletePersonDialog from './delete-person-dialog';

type PersonRowActionsProps = {
  personId: string;
  personName: string;
  canUpdate: boolean;
  canDelete: boolean;
};

export default function PersonRowActions({
  personId,
  personName,
  canUpdate,
  canDelete,
}: PersonRowActionsProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant='ghost'
            size='icon-sm'
            aria-label={`Ações de ${personName}`}
            className='text-muted-foreground'
          >
            <Menu />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-44'>
          {/* A edição fica na página do registro; sem `.update` ela é só leitura. */}
          <DropdownMenuItem asChild>
            <Link href={`/persons/${personId}`}>
              {canUpdate ? <Pencil /> : <Eye />}
              {canUpdate ? 'Editar' : 'Visualizar'}
            </Link>
          </DropdownMenuItem>

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive' onSelect={() => setIsDeleteOpen(true)}>
                <Trash2 />
                Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fora do menu: o diálogo continua aberto depois que o menu fecha. */}
      {canDelete && (
        <DeletePersonDialog
          personId={personId}
          personName={personName}
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onDeleted={() => router.refresh()}
          returnFocusRef={triggerRef}
        />
      )}
    </>
  );
}
