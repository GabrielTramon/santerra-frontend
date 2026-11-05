'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness, type LucideIcon, Tractor } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePerson } from '@/hooks/persons/use-create-person';
import { useUpdatePerson } from '@/hooks/persons/use-update-person';
import { getApiErrorMessage, isApiErrorWithStatus } from '@/lib/api';
import { maskNationalId, maskPhone, onlyDigits } from '@/lib/format';
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

function digitsOrNull(value: string): string | null {
  return onlyDigits(value) || null;
}

// O tipo só existe no cadastro: a API da pessoa não informa o tipo, então a edição não o mostra.
function getPersonFormSchema(isCreating: boolean) {
  return z
    .object({
      name: z.string().trim().min(1, 'Informe o nome'),
      nationalId: z
        .string()
        .refine(
          (value) => [0, 11, 14].includes(onlyDigits(value).length),
          'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)',
        )
        .transform(digitsOrNull),
      phoneNumber: z
        .string()
        .refine(
          (value) => [0, 10, 11].includes(onlyDigits(value).length),
          'Informe o telefone com DDD',
        )
        .transform(digitsOrNull),
      email: z
        .string()
        .trim()
        .refine((value) => !value || z.email().safeParse(value).success, 'Informe um e-mail válido')
        .transform((value) => value || null),
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
    // Com um tipo só disponível, ele já vem marcado.
    type: personTypes.length === 1 ? personTypes[0] : undefined,
    potentialId: '',
  };
}

type PersonFormProps = {
  // Edição. Sem `person` é cadastro, e `personTypes` são os tipos que o usuário pode escolher.
  person?: Person;
  personTypes?: PersonType[];
  potentials?: Pick<Potential, 'id' | 'name'>[];
};

export default function PersonForm({ person, personTypes = [], potentials = [] }: PersonFormProps) {
  const router = useRouter();
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

    let savedPerson: Person;

    try {
      if (person) {
        savedPerson = await updatePerson(person.id, values);
      } else if (type) {
        savedPerson = await createPerson({ ...values, type, potentialId });
      } else {
        // O schema do cadastro já exige o tipo.
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

    if (person) {
      reset(toFormValues(savedPerson));
      toast.success('Alterações salvas.');
      router.refresh();
      return;
    }

    toast.success('Pessoa cadastrada.');
    router.push('/admin/persons');
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleSave)} className='animate-fade-up [animation-delay:80ms]'>
      <Card>
        <CardHeader>
          <CardTitle>Dados da pessoa</CardTitle>
          <CardDescription>
            {person
              ? 'Nome, documento e formas de contato.'
              : 'Tipo, nome, documento e formas de contato.'}
          </CardDescription>
        </CardHeader>

        <CardContent className='gap-5'>
          {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}

          {!person && (
            <>
              <Controller
                name='type'
                control={control}
                render={({ field, fieldState }) => (
                  <FieldSet data-invalid={fieldState.invalid} className='gap-3'>
                    <FieldLegend variant='label'>
                      Tipo de pessoa{' '}
                      <span aria-hidden='true' className='text-destructive'>
                        *
                      </span>
                    </FieldLegend>
                    <RadioGroup
                      name={field.name}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      aria-required
                      aria-invalid={fieldState.invalid}
                      className='sm:grid-cols-2'
                    >
                      {personTypes.map((type) => {
                        const { label, description, icon: Icon } = PERSON_TYPE_CHOICES[type];

                        return (
                          <FieldLabel key={type} htmlFor={`person-type-${type}`}>
                            <Field orientation='horizontal'>
                              <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300'>
                                <Icon className='size-4' />
                              </span>
                              <FieldContent>
                                <FieldTitle>{label}</FieldTitle>
                                <FieldDescription>{description}</FieldDescription>
                              </FieldContent>
                              <RadioGroupItem
                                id={`person-type-${type}`}
                                value={type}
                                aria-invalid={fieldState.invalid}
                              />
                            </Field>
                          </FieldLabel>
                        );
                      })}
                    </RadioGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                )}
              />

              {selectedType === 'producer' && (
                <Controller
                  name='potentialId'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        <span>
                          Potencial{' '}
                          <span aria-hidden='true' className='text-destructive'>
                            *
                          </span>
                        </span>
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={potentials.length === 0}
                      >
                        <SelectTrigger
                          ref={field.ref}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          className='w-full'
                        >
                          <SelectValue
                            placeholder={
                              potentials.length > 0
                                ? 'Selecione o potencial'
                                : 'Nenhum potencial cadastrado'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent position='popper'>
                          {potentials.map((potential) => (
                            <SelectItem key={potential.id} value={potential.id}>
                              {potential.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {potentials.length > 0
                          ? 'Classificação do produtor pela empresa.'
                          : 'Cadastre um potencial antes de cadastrar produtores.'}
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}

              <FieldSeparator />
            </>
          )}

          <div className='grid gap-5 sm:grid-cols-2'>
            <Controller
              name='name'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='sm:col-span-2'>
                  <FieldLabel htmlFor={field.name}>
                    <span>
                      Nome{' '}
                      <span aria-hidden='true' className='text-destructive'>
                        *
                      </span>
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    required
                    autoComplete='name'
                    placeholder='Nome completo ou razão social'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='nationalId'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>CPF ou CNPJ</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    inputMode='numeric'
                    placeholder='000.000.000-00'
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => field.onChange(maskNationalId(event.target.value))}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='phoneNumber'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Telefone</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='tel'
                    autoComplete='tel-national'
                    placeholder='(00) 00000-0000'
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => field.onChange(maskPhone(event.target.value))}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='email'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='sm:col-span-2'>
                  <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='email'
                    autoComplete='email'
                    placeholder='nome@exemplo.com'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className='justify-end gap-2 border-t'>
          {person ? (
            <Button
              type='button'
              variant='outline'
              disabled={!isDirty || isSubmitting}
              onClick={() => reset()}
            >
              Descartar alterações
            </Button>
          ) : (
            <Link href='/admin/persons' className={buttonVariants({ variant: 'outline' })}>
              Cancelar
            </Link>
          )}

          <Button
            type='submit'
            disabled={Boolean(person) && !isDirty}
            loading={isSubmitting}
            loadingText='Salvando...'
          >
            {person ? 'Salvar alterações' : 'Cadastrar pessoa'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
