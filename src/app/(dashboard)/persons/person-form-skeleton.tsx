import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

const FIELD_SPANS = ['sm:col-span-2', '', '', 'sm:col-span-2'];

type PersonFormSkeletonProps = {
  // Cadastro: os cards de "Tipo de pessoa" acima dos campos.
  hasType?: boolean;
};

export default function PersonFormSkeleton({ hasType = false }: PersonFormSkeletonProps) {
  return (
    <div className='rounded-xl border bg-card p-6'>
      <Skeleton className='h-5 w-36' />
      <Skeleton className='mt-2 h-4 w-60 max-w-full' />

      {hasType && (
        <div className='mt-6 flex flex-col gap-3 border-b pb-6'>
          <Skeleton className='h-4 w-28' />
          <div className='grid gap-3 sm:grid-cols-2'>
            <Skeleton className='h-[66px] w-full rounded-md' />
            <Skeleton className='h-[66px] w-full rounded-md' />
          </div>
        </div>
      )}

      <div className='mt-6 grid gap-5 sm:grid-cols-2'>
        {FIELD_SPANS.map((span, index) => (
          <div key={index} className={cn('flex flex-col gap-2', span)}>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-9 w-full' />
          </div>
        ))}
      </div>

      <div className='mt-6 flex justify-end gap-2 border-t pt-6'>
        <Skeleton className='h-9 w-28' />
        <Skeleton className='h-9 w-36' />
      </div>
    </div>
  );
}
