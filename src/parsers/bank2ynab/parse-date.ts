import { parse } from 'date-fns';

// See https://github.com/bank2ynab/bank2ynab/wiki/DateFormatting#dates-in-data-rows
export const placeholders: { [k: string]: string } = {
  '%y': 'yy', // 2-digit year
  '%Y': 'yyyy', // 4-digit year
  '%m': 'MM', // 2-digit month
  '%b': 'MMM', // Month as abbreviated name
  '%d': 'dd', // 2-digit day
  '%H': 'HH', // 2-digit hour (24h)
  '%M': 'mm', // 2-digit minutes
  '%S': 'ss', // 2-digit seconds
};

export const parseDate = (input: string, format?: string) => {
  if (!format) {
    return Date.parse(input);
  }

  const convertedFormat = Object.keys(placeholders).reduce(
    (acc, cur) => acc.replace(cur, placeholders[cur]),
    format,
  );

  return parse(input, convertedFormat, new Date());
};
