'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness, type LucideIcon, Tractor } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { FormRadioCards } from '@/components/form/form-radio-cards';
import { FormSelect } from '@/components/form/form-select';
import { FieldSeparator } from '@/components/ui/field';
import { useCreatePerson } from '@/hooks/persons/use-create-person';
import { useUpdatePerson } from '@/hooks/persons/use-update-person';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithStatus } from '@/lib/api';
import { maskNationalId, maskPhone } from '@/lib/format';
import {
  optionalEmailSchema,
  optionalNationalIdSchema,
  optionalPhoneSchema,
} from '@/lib/schemas';
import type { Person, PersonType } from '@/types/person';
import type { Potential } from '@/types/potential';

const PERSON_TYPE_CHOICES: Record<
  PersonType,
  { label: string; description: string; icon: LucideIcon }
> = {
  employee: {
    label: 'Funcionário',
    description: 'Faz parte da equipe da empresa.',
    icon: BriefcaseBusiness,
  },
  producer: {
    label: 'Produtor',
    description: 'Produtor rural atendido pela empresa.',
    icon: Tractor,
  },
};

function getPersonFormSchema(isCreating: boolean) {
  return z
    .object({
      name: z.string().trim().min(1, 'Informe o nome'),
      nationalId: optionalNationalIdSchema,
      phoneNumber: optionalPhoneSchema,
      email: optionalEmailSchema,
      type: z.enum(['employee', 'producer']).optional(),
      potentialId: z.string(),
    })
    .superRefine((values, context) => {
      if (!isCreating) {
        return;
      }

      if (!values.type) {
        context.addIssue({ code: 'custom', path: ['type'], message: 'Selecione o tipo de pessoa' });
      }

      if (values.type === 'producer' && !values.potentialId) {
        context.addIssue({
          code: 'custom',
          path: ['potentialId'],
          message: 'Selecione o potencial do produtor',
        });
      }
    });
}

const createPersonFormSchema = getPersonFormSchema(true);
const updatePersonFormSchema = getPersonFormSchema(false);

type PersonFormInput = z.input<typeof createPersonFormSchema>;
type PersonFormOutput = z.output<typeof createPersonFormSchema>;

function toFormValues(person?: Person, personTypes: PersonType[] = []): PersonFormInput {
  return {
    name: person?.name ?? '',
    nationalId: person?.nationalId ? maskNationalId(person.nationalId) : '',
    phoneNumber: person?.phoneNumber ? maskPhone(person.phoneNumber) : '',
    email: person?.email ?? '',
    type: personTypes.length === 1 ? personTypes[0] : undefined,
    potentialId: '',
  };
}

function getPotentialDescription(hasPotentials: boolean, canCreatePotential: boolean): ReactNode {
  if (hasPotentials) {
    return 'Classificação do produtor pela empresa.';
  }

  if (!canCreatePotential) {
    return 'Cadastre um potencial antes de cadastrar produtores.';
  }

  return (
    <>
      <Link href='/admin/potentials/new'>Cadastre um potencial</Link> antes de cadastrar produtores.
    </>
  );
}

type PersonFormProps = {
  person?: Person;
  personTypes?: PersonType[];
  potentials?: Pick<Potential, 'id' | 'name'>[];
  canCreatePotential?: boolean;
};

export default function PersonForm({
  person,
  personTypes = [],
  potentials = [],
  canCreatePotential = false,
}: PersonFormProps) {
  const returnToList = useReturnToList('/admin/persons');
  const { mutate: createPerson } = useCreatePerson();
  const { mutate: updatePerson } = useUpdatePerson();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(person ? updatePersonFormSchema : createPersonFormSchema),
    defaultValues: toFormValues(person, personTypes),
  });
  const selectedType = useWatch({ control, name: 'type' });

  async function handleSave({ type, potentialId, ...values }: PersonFormOutput) {
    setErrorMessage(null);

    try {
      if (person) {
        await updatePerson(person.id, values);
      } else if (type) {
        await createPerson({ ...values, type, potentialId });
      } else {
        return;
      }
    } catch (error) {
      if (isApiErrorWithStatus(error, 409)) {
        setError('nationalId', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(person ? 'Alterações salvas.' : 'Pessoa cadastrada.');
  }

  return (
    <FormCard
      title='Dados da pessoa'
      description={
        person ? 'Nome, documento e formas de contato.' : 'Tipo, nome, documento e formas de contato.'
      }
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(person)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/persons'
      createLabel='Cadastrar pessoa'
    >
      {!person && (
        <>
          <FormRadioCards
            control={control}
            name='type'
            label='Tipo de pessoa'
            required
            options={personTypes.map((type) => ({ value: type, ...PERSON_TYPE_CHOICES[type] }))}
          />

          {selectedType === 'producer' && (
            <FormSelect
              control={control}
              name='potentialId'
              label='Potencial'
              required
              options={potentials.map(({ id, name }) => ({ value: id, label: name }))}
              placeholder={
                potentials.length > 0 ? 'Selecione o potencial' : 'Nenhum potencial cadastrado'
              }
              disabled={potentials.length === 0}
              description={getPotentialDescription(potentials.length > 0, canCreatePotential)}
            />
          )}

          <FieldSeparator />
        </>
      )}

      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='name'
          placeholder='Nome completo ou razão social'
          className='sm:col-span-2'
        />
        <FormInput
          control={control}
          name='nationalId'
          label='CPF ou CNPJ'
          inputMode='numeric'
          placeholder='000.000.000-00'
          mask={maskNationalId}
        />
        <FormInput
          control={control}
          name='phoneNumber'
          label='Telefone'
          type='tel'
          autoComplete='tel-national'
          placeholder='(00) 00000-0000'
          mask={maskPhone}
        />
        <FormInput
          control={control}
          name='email'
          label='E-mail'
          type='email'
          autoComplete='email'
          placeholder='nome@exemplo.com'
          className='sm:col-span-2'
        />
      </div>
    </FormCard>
  );
}
