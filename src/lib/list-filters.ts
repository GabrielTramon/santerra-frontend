import { toDayBoundary } from './format';
import { getSearchParam, isIsoDate, type SearchParams } from './list-params';

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterDefinition =
  | { type: 'select'; key: string; label: string; options: FilterOption[] }
  | { type: 'checkboxes'; key: string; label: string; options: FilterOption[] }
  | { type: 'dateRange'; label: string; fromKey: string; toKey: string };

export type FilterValues = Record<string, string>;

export function getFilterKeys(filters: FilterDefinition[]): string[] {
  return filters.flatMap((filter) =>
    filter.type === 'dateRange' ? [filter.fromKey, filter.toKey] : [filter.key],
  );
}

function parseFilter(searchParams: SearchParams, filter: FilterDefinition): [string, string][] {
  if (filter.type === 'dateRange') {
    return [filter.fromKey, filter.toKey].map((key) => {
      const value = getSearchParam(searchParams, key);

      return [key, isIsoDate(value) ? value : ''];
    });
  }

  const value = getSearchParam(searchParams, filter.key);

  if (filter.type === 'select') {
    return [[filter.key, filter.options.some((option) => option.value === value) ? value : '']];
  }

  const selected = value.split(',');

  return [
    [
      filter.key,
      filter.options
        .filter((option) => selected.includes(option.value))
        .map((option) => option.value)
        .join(','),
    ],
  ];
}

export function parseFilters(searchParams: SearchParams, filters: FilterDefinition[]): FilterValues {
  return Object.fromEntries(filters.flatMap((filter) => parseFilter(searchParams, filter)));
}

export function toApiFilters(values: FilterValues, filters: FilterDefinition[]): FilterValues {
  const apiValues = { ...values };

  filters.forEach((filter) => {
    if (filter.type === 'dateRange') {
      const from = values[filter.fromKey];
      const to = values[filter.toKey];

      apiValues[filter.fromKey] = from && toDayBoundary(from, 'start');
      apiValues[filter.toKey] = to && toDayBoundary(to, 'end');
    }
  });

  return apiValues;
}
