import type { PersonType } from '@/types/person';

// Tipos que o usuário pode escolher ao cadastrar uma pessoa: cada vínculo pede a permissão do
// próprio recurso, e produtor também precisa listar os potenciais (o potencial é obrigatório).
// Sem nenhum tipo disponível, não dá para cadastrar pessoa.
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
