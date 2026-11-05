import { z } from 'zod';

import { MIN_PASSWORD_LENGTH } from './password';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail')
  .pipe(z.email('Informe um e-mail válido'));

export function createPasswordConfirmationSchema(confirmationMessage: string) {
  return z
    .object({
      password: z
        .string()
        .min(MIN_PASSWORD_LENGTH, `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`),
      passwordConfirmation: z.string().min(1, confirmationMessage),
    })
    .refine((values) => values.password === values.passwordConfirmation, {
      message: 'As senhas não conferem',
      path: ['passwordConfirmation'],
    });
}
