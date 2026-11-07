'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { ConfirmDeleteDialog, type DeleteDialogOptions } from './confirm-delete-dialog';

type DeleteRecordButtonProps = DeleteDialogOptions & {
  listHref: string;
};

export function DeleteRecordButton({ listHref, ...dialog }: DeleteRecordButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ConfirmDeleteDialog
      {...dialog}
      open={isOpen}
      onOpenChange={setIsOpen}
      onDeleted={() => router.push(listHref)}
    >
      <Button variant='destructive'>
        <Trash2 />
        Excluir
      </Button>
    </ConfirmDeleteDialog>
  );
}
