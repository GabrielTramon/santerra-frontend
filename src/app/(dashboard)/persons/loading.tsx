import { PageHeaderSkeleton } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonsLoading() {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeaderSkeleton hasActions hasSearch />

      <div className='overflow-hidden rounded-xl border bg-card'>
        <div className='h-10 border-b bg-muted/50' />
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className='flex items-center gap-3 border-b px-4 py-3'>
            <Skeleton className='size-9 rounded-full' />
            <div className='flex flex-1 flex-col gap-1.5'>
              <Skeleton className='h-4 w-44 max-w-full' />
              <Skeleton className='h-3 w-56 max-w-full' />
            </div>
            <Skeleton className='hidden h-4 w-28 sm:block' />
            <Skeleton className='hidden h-4 w-28 md:block' />
            <Skeleton className='hidden h-4 w-20 lg:block' />
            <Skeleton className='mr-2 ml-4 size-8' />
          </div>
        ))}
        <div className='grid grid-cols-2 items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_auto_1fr]'>
          <Skeleton className='h-8 w-36' />
          <Skeleton className='col-span-2 row-start-1 h-9 w-72 max-w-full justify-self-center sm:col-span-1 sm:col-start-2' />
          <Skeleton className='h-5 w-24 justify-self-end' />
        </div>
      </div>
    </div>
  );
}
