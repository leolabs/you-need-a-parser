import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../util/papaparse';
import { readEncodedFile } from '../../util/read-encoded-file';

export interface Row {
  Kontonummer: string;
  'Datum/Zeit': string;
  Buchungstag: string;
  Wertstellung: string;
  'Soll/Haben': string;
  Buchungsschlüssel: string;
  Buchungsart: string;
  'Empfänger/Auftraggeber Name': string;
  'Empfänger/Auftraggeber IBAN': string;
  'Empfänger/Auftraggeber BIC': string;
  'Glaeubiger-ID': string;
  Mandatsreferenz: string;
  Mandatsdatum: string;
  'Vwz.0': string;
  'Vwz.1': string;
  'Vwz.2': string;
  'Vwz.3': string;
  'Vwz.4': string;
  'Vwz.5': string;
  'Vwz.6': string;
  'Vwz.7': string;
  'Vwz.8': string;
  'Vwz.9': string;
  'Vwz.10': string;
  'Vwz.11': string;
  'Vwz.12': string;
  'Vwz.13': string;
  'Vwz.14': string;
  'Vwz.15': string;
  'Vwz.16': string;
  'Vwz.17': string;
  'End-to-End-Identifikation': string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, day, month, year] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const parseNumber = (input: string) =>
  Number(input.replace(/\./g, '').replace(',', '.'));

export const getMergedMemo = (r: Row) =>
  [
    r['Vwz.0'],
    r['Vwz.1'],
    r['Vwz.2'],
    r['Vwz.3'],
    r['Vwz.4'],
    r['Vwz.5'],
    r['Vwz.6'],
    r['Vwz.7'],
    r['Vwz.8'],
    r['Vwz.9'],
    r['Vwz.10'],
    r['Vwz.11'],
    r['Vwz.12'],
    r['Vwz.13'],
    r['Vwz.14'],
    r['Vwz.15'],
    r['Vwz.16'],
    r['Vwz.17'],
  ]
    .filter(Boolean)
    // When the string is 35 characters long, it's likely to overflow into the next
    // field, so we don't add a space. Otherwise, we add a space for separation.
    .map(s => (s.length >= 35 ? s : s + ' '))
    .join('')
    .trim();

export const _1822direktParser: ParserFunction = async (file: File) => {
  const fileString = await readEncodedFile(file, 'win1252');
  const { data }: { data: Row[] } = await parse(fileString, { header: true });

  return [
    {
      accountName: String(data[0]?.Kontonummer),
      data: (data as Row[])
        .filter(r => r.Buchungstag && r['Soll/Haben'])
        .map(r => ({
          Date: generateYnabDate(r.Buchungstag),
          Payee: r['Empfänger/Auftraggeber Name'],
          Memo: getMergedMemo(r),
          Outflow:
            parseNumber(r['Soll/Haben']) < 0
              ? (-parseNumber(r['Soll/Haben'])).toFixed(2)
              : undefined,
          Inflow:
            parseNumber(r['Soll/Haben']) > 0
              ? parseNumber(r['Soll/Haben']).toFixed(2)
              : undefined,
        })),
    },
  ];
};

export const _1822direktMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof Row)[] = [
    'Buchungstag',
    'Soll/Haben',
    'Vwz.0',
    'Empfänger/Auftraggeber Name',
  ];

  const rawFileString = await readEncodedFile(file, 'win1252');

  if (
    rawFileString.startsWith(
      'Kontonummer;Datum/Zeit;Buchungstag;Wertstellung;Soll/Haben;Buchungsschlüssel;Buchungsart;Empfänger/Auftraggeber Name;Empfänger/Auftraggeber IBAN;Empfänger/Auftraggeber BIC;Glaeubiger-ID;',
    )
  ) {
    return true;
  }

  if (rawFileString.length === 0) {
    return false;
  }

  try {
    const { data } = await parse(rawFileString, { header: true });

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

export const _1822direkt: ParserModule = {
  name: '1822direkt',
  country: 'de',
  fileExtension: 'csv',
  filenamePattern: /^umsaetze-\d+-\d{2}\.\d{2}.\d{4}_\d{2}_\d{2}\.csv$/,
  link: 'https://www.1822direkt.de/',
  match: _1822direktMatcher,
  parse: _1822direktParser,
};
