export const DEFAULT_CALLBACK_URL = '/admin';

export function getSafeCallbackUrl(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\') ||
    value.startsWith('/auth')
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  return value;
}
