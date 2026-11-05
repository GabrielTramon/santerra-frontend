'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import DeletePersonDialog from './delete-person-dialog';

type DeletePersonButtonProps = {
  personId: string;
  personName: string;
};

export default function DeletePersonButton({ personId, personName }: DeletePersonButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DeletePersonDialog
      personId={personId}
      personName={personName}
      open={isOpen}
      onOpenChange={setIsOpen}
      onDeleted={() => router.push('/admin/persons')}
    >
      <Button variant='destructive'>
        <Trash2 />
        Excluir
      </Button>
    </DeletePersonDialog>
  );
}
