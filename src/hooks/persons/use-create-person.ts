import { useSession } from 'next-auth/react';

import { useMutation } from '@/hooks/use-mutation';
import { apiRequest } from '@/lib/api';
import type { Person, PersonInput, PersonType } from '@/types/person';

export type CreatePersonInput = PersonInput & {
  type: PersonType;
  // Obrigatório para produtor (o backend exige).
  potentialId?: string;
};

// Cadastra a pessoa e, em seguida, o vínculo do tipo escolhido (funcionário ou produtor).
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
      // Toda pessoa tem um tipo: sem o vínculo, desfaz o cadastro. Se até isso falhar, ela
      // continua na lista (sem tipo) para ser excluída à mão.
      await apiRequest(`/persons/${person.id}`, { method: 'DELETE', token }).catch(() => undefined);
      throw error;
    }

    return person;
  });
}
