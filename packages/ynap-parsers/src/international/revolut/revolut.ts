import 'mdn-polyfills/String.prototype.startsWith';
import { parse, format } from 'date-fns';
import isEqual from 'lodash/isEqual';

import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse as parseCsv } from '../../util/papaparse';

export const generateYnabDate = (input: string) => {
  const match = parse(input, 'MMM dd, yyyy', Date.now());
  return format(match, 'MM/dd/yyyy');
};

export const revolutParser: ParserFunction = async (file: File) => {
  const { data } = await parseCsv(file, { header: false });

  return [
    {
      data: (data as string[][])
        .slice(1)
        .filter(r => r[0])
        .map(r => ({
          Date: generateYnabDate(r[0]),
          Payee: r[1].trim(),
          Category: r[7].trim(),
          Memo: r[1].trim(),
          Outflow: r[2].trim() ? Number(r[2]).toFixed(2) : undefined,
          Inflow: r[3].trim() ? Number(r[3]).toFixed(2) : undefined,
        })),
    },
  ];
};

export const revolutMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: string[] = ['Completed Date', 'Description'];

  const { data } = await parseCsv(file, { preview: 1 });

  if (data.length === 0) {
    return false;
  }

  if (isEqual(data[0].slice(0, 2).map(r => r.trim()), requiredKeys)) {
    return true;
  }

  return false;
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
