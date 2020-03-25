import 'mdn-polyfills/String.prototype.startsWith';
import { parse, format } from 'date-fns';

import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse as parseCsv } from '../../util/papaparse';

const COMPLETED_DATE = 0;
const REFERENCE = 1;
const PAID_OUT = 2;
const PAID_IN = 3;
const CATEGORY = 8;

export const generateYnabDate = (input: string) => {
  let match = parse(input, 'dd MMM', Date.now());
  if (!isValidDate(match)) {
    match = parse(input, 'dd MMM yyyy', Date.now());
  }
  return format(match, 'yyyy-MM-dd');
};

export const revolutParser: ParserFunction = async (file: File) => {
  const { data } = await parseCsv(file, { header: false });

  return [
    {
      data: (data as string[][])
        .slice(1)
        .filter(r => r[0])
        .map(r => ({
          Date: generateYnabDate(r[COMPLETED_DATE]),
          Payee: r[REFERENCE].trim(),
          Category: r[CATEGORY].trim(),
          Memo: r[REFERENCE].trim(),
          Outflow: r[PAID_OUT].trim() ? Number(r[PAID_OUT]).toFixed(2) : undefined,
          Inflow: r[PAID_IN].trim() ? Number(r[PAID_IN]).toFixed(2) : undefined,
        })),
    },
  ];
};

export const revolutMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: string[] = ['Completed Date', 'Reference', 'Exchange Rate', 'Category'];

  const { data } = await parseCsv(file, { preview: 1 });

  if (data.length === 0) {
    return false;
  }

  const csvColumnNames = data[0].map(r => r.trim());
  return requiredKeys.every(key => csvColumnNames.includes(key));
};

export const revolut: ParserModule = {
  name: 'Revolut',
  country: 'international',
  fileExtension: 'csv',
  filenamePattern: /^Revolut-(.+)-Statement-(.+)\.csv$/,
  link: 'https://blog.revolut.com/new-feature-exportable-statements/',
  match: revolutMatcher,
  parse: revolutParser,
};

const isValidDate = (date: Date) => !isNaN(date.getTime());
