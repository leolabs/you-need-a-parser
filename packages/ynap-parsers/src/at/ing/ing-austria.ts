import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../util/papaparse';
import { readEncodedFile } from '../../util/read-encoded-file';

export interface IngAustriaRow {
  IBAN: string;
  Text: string;
  Valutadatum: string;
  Währung: string;
  Soll: string;
  Haben: string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY.MM.DD');
  }

  const [, day, month, year] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const parseNumber = (input: string) => Number(input.replace(',', '.'));

export const ingAustriaParser: ParserFunction = async (file: File) => {
  const fileString = await readEncodedFile(file);
  const { data } = await parse(fileString, { header: true, delimiter: ';' });

  return [
    {
      data: (data as IngAustriaRow[])
        .filter(r => r.Valutadatum && (r.Soll || r.Haben))
        .map(r => ({
          Date: generateYnabDate(r.Valutadatum),
          Payee: r.Text,
          Memo: undefined,
          Outflow: r.Soll != "0,00" ? parseNumber(r.Soll).toFixed(2) : undefined,
          Inflow: r.Haben != "0,00" ? parseNumber(r.Haben).toFixed(2) : undefined,
        })),
    },
  ];
};

export const ingAustriaMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof IngAustriaRow)[] = [
    'IBAN',
    'Text',
    'Valutadatum',
    'Währung',
    'Soll',
    'Haben',
  ];

  const rawFileString = await readEncodedFile(file);

  if (rawFileString.startsWith('IBAN;Text;Valutadatum;Währung;Soll;Haben')) {
    return true;
  }

  try {
    const { data } = await parse(rawFileString, {
      header: true,
      delimiter: ';',
    });

    if (data.length === 0) {
      return false;
    }

    const keys = Object.keys(data[0]);
    const missingKeys = requiredKeys.filter(k => !keys.includes(k));

    if (missingKeys.length === 0) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

export const ingAustria: ParserModule = {
  name: 'ING Austria',
  country: 'at',
  fileExtension: 'csv',
  filenamePattern: /^ING_Umsaetze\.csv$/,
  link: 'https://www.ing.at/',
  match: ingAustriaMatcher,
  parse: ingAustriaParser,
};
