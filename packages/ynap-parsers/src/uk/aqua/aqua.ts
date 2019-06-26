import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '../..';
import { parse } from '../../util/papaparse';

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (!match) {
    throw new Error(
      'The input is not a valid date. Expected format: DD/MM/YYYY, got ' + input,
    );
  }

  const [, day, month, year] = match;
  return [month, day, year].join('/');
};

export const aquaParser: ParserFunction = async (file: File) => {
  const { data } = await parse(file, { header: false });

  const rows = (data as string[][])
    .slice(1)
    .filter(r => r.length >= 3)
    .filter(r => r[0] !== 'Pending')
    .map(
      cur =>
        ({
          Date: generateYnabDate(cur[0]),
          Memo: cur[1].trim().replace(/\s\s+/g, ' '),
          Inflow: Number(cur[2]) < 0 ? (-Number(cur[2])).toFixed(2) : undefined,
          Outflow: Number(cur[2]) > 0 ? Number(cur[2]).toFixed(2) : undefined,
        } as YnabRow),
    );

  return [
    {
      data: rows,
    },
  ];
};

export const aquaMatcher: MatcherFunction = async (file: File) => {
  const { data } = await parse(file, { header: false });

  const requiredKeys = ['Date', 'Description'];

  if (data.length === 0) {
    return false;
  }

  const keys = data[0];
  const missingKeys = requiredKeys.filter(k => !keys.includes(k));

  if (missingKeys.length === 0) {
    return true;
  }

  return false;
};

export const aqua: ParserModule = {
  name: 'Aqua',
  country: 'uk',
  fileExtension: 'csv',
  filenamePattern: /^transactions\.csv$/,
  link: 'https://www.aquacard.co.uk/',
  match: aquaMatcher,
  parse: aquaParser,
};
