import type { PersonType } from '@/types/person';

export function getCreatablePersonTypes(permissions: string[]): PersonType[] {
  const types: PersonType[] = [];

  if (permissions.includes('employees.create')) {
    types.push('employee');
  }

  if (permissions.includes('producers.create') && permissions.includes('potentials.read')) {
    types.push('producer');
  }

  return types;
}
