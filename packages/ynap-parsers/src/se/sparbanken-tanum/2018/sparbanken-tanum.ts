import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../../..';
import { parse } from '../../../util/papaparse';

/*
 * Row format:
 * Payee; date; skip; Inflow and Outflow; skip
 */

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const toNumber = (input: string) =>
  Number(input.replace(',', '.').replace(' ', ''));

export const sparbankenTanumParser: ParserFunction = async (file: File) => {
  const { data } = await parse(file, { delimiter: ';' });

  return [
    {
      data: data
        .filter(r => r[0] && r[2] !== '-')
        .map(r => ({
          Date: generateYnabDate(r[1]),
          Payee: String(r[0]).trim(),
          Outflow: toNumber(r[3]) < 0 ? (-toNumber(r[3])).toFixed(2) : undefined,
          Inflow: toNumber(r[3]) > 0 ? toNumber(r[3]).toFixed(2) : undefined,
        })),
    },
  ];
};

export const sparbankenTanumMatcher: MatcherFunction = async (file: File) => {
  const { data } = await parse(file, { delimiter: ';' });

  // Check if the file contains any data
  if (data.length === 0) {
    return false;
  }

  // Check if the second field is a date
  if (!String(data[0][1]).match(/\d{4}-\d{2}-\d{2}/)) {
    return false;
  }

  // Check if the fourth field is a valid number
  if (!String(data[0][3]).match(/-?[\d ]+,\d{2}/)) {
    return false;
  }

  return true;
};

export const sparbankenTanum: ParserModule = {
  name: 'Sparbanken Tanum',
  country: 'se',
  fileExtension: 'csv',
  filenamePattern: /^export\.csv$/,
  link: 'https://www.sparbankentanum.se/',
  match: sparbankenTanumMatcher,
  parse: sparbankenTanumParser,
};
