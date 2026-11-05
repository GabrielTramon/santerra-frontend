import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { formatNationalId, formatPhone } from '@/lib/format';
import type { Person } from '@/types/person';

type PersonDetailsProps = {
  person: Person;
};

export default function PersonDetails({ person }: PersonDetailsProps) {
  const fields = [
    { label: 'Nome', value: person.name, wide: true },
    { label: 'CPF ou CNPJ', value: person.nationalId && formatNationalId(person.nationalId) },
    { label: 'Telefone', value: person.phoneNumber && formatPhone(person.phoneNumber) },
    { label: 'E-mail', value: person.email, wide: true },
  ];

  return (
    <Card className='animate-fade-up [animation-delay:80ms]'>
      <CardHeader>
        <CardTitle>Dados da pessoa</CardTitle>
        <CardDescription>Você tem permissão apenas para visualizar este cadastro.</CardDescription>
      </CardHeader>

      <CardContent>
        <dl className='grid gap-5 sm:grid-cols-2'>
          {fields.map(({ label, value, wide }) => (
            <div key={label} className={cn('flex min-w-0 flex-col gap-1', wide && 'sm:col-span-2')}>
              <dt className='text-sm text-muted-foreground'>{label}</dt>
              <dd
                className={cn(
                  'text-sm font-medium wrap-break-word text-foreground',
                  !value && 'font-normal text-muted-foreground',
                )}
              >
                {value || 'Não informado'}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
