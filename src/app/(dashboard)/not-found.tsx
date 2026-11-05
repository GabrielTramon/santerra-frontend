import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default function DashboardNotFound() {
  return (
    <Empty className='border bg-card animate-fade-up'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <FileQuestion />
        </EmptyMedia>
        <EmptyTitle>Página não encontrada</EmptyTitle>
        <EmptyDescription>
          O conteúdo que você procura não existe, foi excluído ou você não tem acesso a ele.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href='/admin' className={buttonVariants({ variant: 'outline' })}>
          Voltar para o início
        </Link>
      </EmptyContent>
    </Empty>
  );
}
