import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';

export function useDeletePerson() {
  const { data: session } = useSession();

  return useMutation((id: string) =>
    apiRequest<void>(`/persons/${id}`, {
      method: 'DELETE',
      token: session?.accessToken,
    }),
  );
}
