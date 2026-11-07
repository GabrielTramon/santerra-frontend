const TIME_ZONE = 'America/Sao_Paulo';
const TIME_ZONE_OFFSET = '-03:00';

const dateFormatters = {
  short: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: TIME_ZONE }),
  long: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: TIME_ZONE }),
};

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeDocumentSearch(term: string): string {
  return /^[\d\s./-]+$/.test(term) ? onlyDigits(term) : term;
}

export function formatDate(
  value: string | Date,
  style: keyof typeof dateFormatters = 'short',
): string {
  return dateFormatters[style].format(new Date(value));
}

export function toDayBoundary(date: string, boundary: 'start' | 'end'): string {
  const time = boundary === 'start' ? '00:00:00.000' : '23:59:59.999';

  return `${date}T${time}${TIME_ZONE_OFFSET}`;
}

function applyMask(digits: string, groups: number[], separators: string[]): string {
  let masked = '';
  let start = 0;

  groups.forEach((size, index) => {
    const part = digits.slice(start, start + size);

    if (part) {
      masked += (index > 0 ? separators[index - 1] : '') + part;
    }

    start += size;
  });

  return masked;
}

export function maskNationalId(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  return digits.length <= 11
    ? applyMask(digits, [3, 3, 3, 2], ['.', '.', '-'])
    : applyMask(digits, [2, 3, 3, 4, 2], ['.', '.', '/', '-']);
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (!digits) {
    return '';
  }

  return `(${applyMask(digits, [2, digits.length > 10 ? 5 : 4, 4], [') ', '-'])}`;
}

export function formatNationalId(value: string): string {
  return [11, 14].includes(onlyDigits(value).length) ? maskNationalId(value) : value;
}

export function formatPhone(value: string): string {
  return [10, 11].includes(onlyDigits(value).length) ? maskPhone(value) : value;
}
