'use client';

import { Trash2 } from 'lucide-react';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useDeletePerson } from '@/hooks/persons/use-delete-person';
import { getApiErrorMessage } from '@/lib/api';

type DeletePersonDialogProps = {
  personId: string;
  personName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  // Gatilho opcional. Sem ele, quem chama abre o diálogo pelo `open` (ex.: item de um menu).
  children?: ReactNode;
  // Sem gatilho, o foco não tem para onde voltar ao fechar: informe o elemento (ex.: o botão do menu).
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function DeletePersonDialog({
  personId,
  personName,
  open,
  onOpenChange,
  onDeleted,
  children,
  returnFocusRef,
}: DeletePersonDialogProps) {
  const { mutate: deletePerson, isPending: isDeleting } = useDeletePerson();

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    // Sem isso o AlertDialog fecha antes de a API responder.
    event.preventDefault();

    try {
      await deletePerson(personId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Não foi possível excluir a pessoa. Tente novamente.'));
      return;
    }

    onOpenChange(false);
    toast.success('Pessoa excluída.');
    onDeleted();
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isDeleting && onOpenChange(nextOpen)}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}

      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          if (returnFocusRef?.current) {
            event.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className='bg-destructive/10 text-destructive'>
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Excluir {personName}?</AlertDialogTitle>
          <AlertDialogDescription>
            A pessoa sai da lista e não poderá mais ser usada nos cadastros. Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant='destructive' disabled={isDeleting} onClick={handleDelete}>
            {isDeleting && <Spinner />}
            {isDeleting ? 'Excluindo...' : 'Excluir pessoa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
