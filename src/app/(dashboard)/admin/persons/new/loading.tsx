import { PageHeaderSkeleton } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';

import PersonFormSkeleton from '../person-form-skeleton';

export default function NewPersonLoading() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <Skeleton className='h-5 w-20' />
      <PageHeaderSkeleton />
      <PersonFormSkeleton hasType />
    </div>
  );
}
