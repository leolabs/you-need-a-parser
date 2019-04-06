import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../../util/papaparse';
import { readEncodedFile } from '../../../util/read-encoded-file';

export interface IngDiBaRow {
  Buchung: string;
  Valuta: string;
  'Auftraggeber/Empfänger': string;
  Buchungstext: string;
  Verwendungszweck: string;
  Betrag: string;
  Währung: string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, day, month, year] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const parseNumber = (input: string) => Number(input.replace(',', '.'));

export const trimMetaData = (input: string) =>
  input.substr(input.indexOf('Buchung;'));

export const ingDiBaParser: ParserFunction = async (file: File) => {
  const fileString = trimMetaData(await readEncodedFile(file));
  const { data } = await parse(fileString, { header: true });

  return [
    {
      data: (data as IngDiBaRow[])
        .filter(r => r.Buchung && r.Betrag)
        .map(r => ({
          Date: generateYnabDate(r.Buchung),
          Payee: r['Auftraggeber/Empfänger'],
          Memo: r.Verwendungszweck,
          Outflow:
            parseNumber(r.Betrag) < 0
              ? (-parseNumber(r.Betrag)).toFixed(2)
              : undefined,
          Inflow:
            parseNumber(r.Betrag) > 0 ? parseNumber(r.Betrag).toFixed(2) : undefined,
        })),
    },
  ];
};

export const ingDiBaMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof IngDiBaRow)[] = [
    'Buchung',
    'Valuta',
    'Auftraggeber/Empfänger',
    'Buchungstext',
    'Verwendungszweck',
  ];

  if (file.name.match(/Umsatzanzeige_(.+)_(\d{8})\.csv/)) {
    return true;
  }

  const rawFileString = await readEncodedFile(file);

  if (rawFileString.startsWith('Umsatzanzeige;Datei erstellt am:')) {
    return true;
  }

  try {
    const { data } = await parse(trimMetaData(rawFileString), { header: true });

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

export const ingDiBa: ParserModule = {
  name: 'ING-DiBa',
  link: 'https://www.ing-diba.de',
  match: ingDiBaMatcher,
  parse: ingDiBaParser,
};
