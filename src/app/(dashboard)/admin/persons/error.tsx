'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type PersonsErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function PersonsError({ retry }: PersonsErrorProps) {
  return (
    <div className='flex flex-col items-start gap-4'>
      <Alert variant='error' title='Não foi possível carregar os dados'>
        Verifique sua conexão e tente novamente.
      </Alert>
      <Button variant='outline' onClick={retry}>
        Tentar novamente
      </Button>
    </div>
  );
}
