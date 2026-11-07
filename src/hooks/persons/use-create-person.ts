import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Person, PersonInput, PersonType } from '@/types/person';

export type CreatePersonInput = PersonInput & {
  type: PersonType;
  potentialId?: string;
};

export function useCreatePerson() {
  const { data: session } = useSession();

  return useMutation(async ({ type, potentialId, ...input }: CreatePersonInput) => {
    const token = session?.accessToken;
    const person = await apiRequest<Person>('/persons', { method: 'POST', body: input, token });

    try {
      if (type === 'employee') {
        await apiRequest('/employees', { method: 'POST', body: { personId: person.id }, token });
      } else {
        await apiRequest('/producers', {
          method: 'POST',
          body: { personId: person.id, potentialId },
          token,
        });
      }
    } catch (error) {
      await apiRequest(`/persons/${person.id}`, { method: 'DELETE', token }).catch(() => undefined);
      throw error;
    }

    return person;
  });
}
