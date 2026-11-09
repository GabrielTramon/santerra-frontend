'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCard } from '@/components/form/form-card';
import { FormInput } from '@/components/form/form-input';
import { useCreateReseller } from '@/hooks/resellers/use-create-reseller';
import { useUpdateReseller } from '@/hooks/resellers/use-update-reseller';
import { useReturnToList } from '@/hooks/use-return-to-list';
import { getApiErrorMessage, isApiErrorWithCode } from '@/lib/api';
import { maskCnpj, maskPhone } from '@/lib/format';
import { optionalCnpjSchema, optionalEmailSchema, optionalPhoneSchema } from '@/lib/schemas';
import type { Reseller } from '@/types/reseller';

const resellerFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da revenda'),
  registrationNumber: optionalCnpjSchema,
  phoneNumber: optionalPhoneSchema,
  email: optionalEmailSchema,
});

type ResellerFormInput = z.input<typeof resellerFormSchema>;
type ResellerFormOutput = z.output<typeof resellerFormSchema>;

function toFormValues(reseller?: Reseller): ResellerFormInput {
  return {
    name: reseller?.name ?? '',
    registrationNumber: reseller?.registrationNumber ? maskCnpj(reseller.registrationNumber) : '',
    phoneNumber: reseller?.phoneNumber ? maskPhone(reseller.phoneNumber) : '',
    email: reseller?.email ?? '',
  };
}

type ResellerFormProps = {
  reseller?: Reseller;
};

export default function ResellerForm({ reseller }: ResellerFormProps) {
  const returnToList = useReturnToList('/admin/resellers');
  const { mutate: createReseller } = useCreateReseller();
  const { mutate: updateReseller } = useUpdateReseller();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(resellerFormSchema),
    defaultValues: toFormValues(reseller),
  });

  async function handleSave(values: ResellerFormOutput) {
    setErrorMessage(null);

    try {
      if (reseller) {
        await updateReseller(reseller.id, values);
      } else {
        await createReseller(values);
      }
    } catch (error) {
      if (isApiErrorWithCode(error, 'CONFLICT')) {
        setError('registrationNumber', { message: error.message }, { shouldFocus: true });
        return;
      }

      setErrorMessage(getApiErrorMessage(error, 'Não foi possível salvar agora. Tente novamente.'));
      return;
    }

    returnToList(reseller ? 'Alterações salvas.' : 'Revenda cadastrada.');
  }

  return (
    <FormCard
      title='Dados da revenda'
      description='Nome, CNPJ e dados de contato.'
      onSubmit={handleSubmit(handleSave)}
      errorMessage={errorMessage}
      isEditing={Boolean(reseller)}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={() => reset()}
      cancelHref='/admin/resellers'
      createLabel='Cadastrar revenda'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='name'
          label='Nome'
          required
          autoComplete='organization'
          placeholder='Razão social ou nome fantasia'
          className='sm:col-span-2'
        />
        <FormInput
          control={control}
          name='registrationNumber'
          label='CNPJ'
          inputMode='numeric'
          placeholder='00.000.000/0000-00'
          mask={maskCnpj}
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
          placeholder='contato@revenda.com.br'
          className='sm:col-span-2'
        />
      </div>
    </FormCard>
  );
}
