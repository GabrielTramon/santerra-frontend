'use client';

import type { FormEventHandler, ReactNode } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type FormCardProps = {
  title: string;
  description: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  errorMessage?: string | null;
  children: ReactNode;
  isEditing: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  onDiscard: () => void;
  cancelHref: string;
  createLabel: string;
};

export function FormCard({
  title,
  description,
  onSubmit,
  errorMessage,
  children,
  isEditing,
  isDirty,
  isSubmitting,
  onDiscard,
  cancelHref,
  createLabel,
}: FormCardProps) {
  return (
    <form noValidate onSubmit={onSubmit} className='animate-fade-up [animation-delay:80ms]'>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className='gap-5'>
          {errorMessage && <Alert variant='error'>{errorMessage}</Alert>}
          {children}
        </CardContent>

        <CardFooter className='justify-end gap-2 border-t'>
          {isEditing ? (
            <Button
              type='button'
              variant='outline'
              disabled={!isDirty || isSubmitting}
              onClick={onDiscard}
            >
              Descartar alterações
            </Button>
          ) : (
            <Button href={cancelHref} variant='outline'>
              Cancelar
            </Button>
          )}

          <Button
            type='submit'
            disabled={isEditing && !isDirty}
            loading={isSubmitting}
            loadingText='Salvando...'
          >
            {isEditing ? 'Salvar alterações' : createLabel}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
