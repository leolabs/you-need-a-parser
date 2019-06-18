import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../util/papaparse';
import { readEncodedFile } from '../../util/read-encoded-file';

// Bancomer Row:
// DATE, DESCRIPTION, OUTFLOW, INFLOW, BALANCE

/*
 * Bancomer files are encoded as UTF16-LE. Since jschardet doesn't seem
 * to recognize that charset most of the time, we need to force it.
 */

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: DD/MM/YYYY');
  }

  const [, day, month, year] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const parseNumber = (input: string) => Number(input.replace(',', ''));

export const trimMetaData = (input: string) => {
  const lines = input.split('\n');

  return lines
    .splice(3)
    .filter(
      l =>
        l && l.trim() !== '' && !l.startsWith('     ') && !l.match(/^"BBVA (.+)"/),
    )
    .join('\n');
};

export const bancomerParser: ParserFunction = async (file: File) => {
  const fileString = trimMetaData(await readEncodedFile(file, 'utf16le'));
  const { data } = await parse(fileString, { delimiter: '\t' });

  return [
    {
      data: (data as string[][])
        .filter(r => r[0] && r[0].trim())
        .map(r => ({
          Date: generateYnabDate(r[0]),
          Memo: r[1],
          Outflow: r[2] ? parseNumber(r[2]) : undefined,
          Inflow: r[3] ? parseNumber(r[3]) : undefined,
        })),
    },
  ];
};

export const bancomerMatcher: MatcherFunction = async (file: File) => {
  if (file.name.match(/^descarga\.[c|t]sv$/)) {
    return true;
  }

  const rawFileString = await readEncodedFile(file, 'utf16le');

  if (rawFileString.length === 0) {
    return false;
  }

  if (
    rawFileString.startsWith('Card number: ') ||
    rawFileString.startsWith('Número de Tarjeta: ')
  ) {
    return true;
  }

  // This might happen when the file encoding is wrong.
  if (rawFileString.indexOf('\n') === -1) {
    return false;
  }

  const headerRow = rawFileString.split('\n')[2].trim();
  if (
    headerRow === 'DATE\tDESCRIPTION\tOUTFLOW\tINFLOW\tBALANCE' ||
    headerRow === 'FECHA\tDESCRIPCIÓN\tCARGO\tABONO\tSALDO'
  ) {
    return true;
  }

  return false;
};

export const bancomer: ParserModule = {
  name: 'bancomer',
  country: 'mx',
  fileExtension: 'csv',
  link: 'https://www.bancomer.com',
  match: bancomerMatcher,
  parse: bancomerParser,
};
