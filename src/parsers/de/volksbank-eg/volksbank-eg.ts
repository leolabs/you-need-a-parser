import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../../util/papaparse';
import { readWindowsFile } from '../../../util/read-windows-file';

export interface VolksbankRow {
  Buchungstag: string;
  Valuta: string;
  'Auftraggeber/Zahlungsempfänger': string;
  'Empfänger/Zahlungspflichtiger': string;
  'Konto-Nr.': string;
  IBAN: string;
  BLZ: string;
  BIC: string;
  'Vorgang/Verwendungszweck': string;
  Kundenreferenz: string;
  Währung: string;
  Umsatz: string;
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

export const trimMetaData = (input: string) => {
  const match = input.match(/\nBuchungstag;(.+?)\n;;;;/s);

  if (!match) {
    throw new Error(
      'Metadata could not be trimmed because the file format is incorrect.',
    );
  }

  return `Buchungstag;${match[1]}`.trim();
};

export const sanitizeMemo = (input: string) => {
  const match = input.match(/[\S]+\n(.+?)(\nVerwendete TAN:.+|$)/s);

  if (!match) {
    return input;
  }

  return match[1].replace(/\n/g, ' ');
};

export const volksbankParser: ParserFunction = async (file: File) => {
  const fileString = trimMetaData(await readWindowsFile(file));
  const { data } = await parse(fileString, { header: true });

  return [
    {
      data: (data as VolksbankRow[])
        .filter(r => r.Valuta && r.Umsatz)
        .map(r => ({
          Date: generateYnabDate(r.Valuta),
          Payee:
            r['Auftraggeber/Zahlungsempfänger'] ||
            r['Empfänger/Zahlungspflichtiger'],
          Memo: sanitizeMemo(r['Vorgang/Verwendungszweck']),
          Outflow:
            parseNumber(r.Umsatz) < 0
              ? (-parseNumber(r.Umsatz)).toFixed(2)
              : undefined,
          Inflow:
            parseNumber(r.Umsatz) > 0 ? parseNumber(r.Umsatz).toFixed(2) : undefined,
        })),
    },
  ];
};

export const volksbankMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof VolksbankRow)[] = [
    'Auftraggeber/Zahlungsempfänger',
    'BIC',
    'BLZ',
    'Buchungstag',
    'Empfänger/Zahlungspflichtiger',
    'IBAN',
    'Konto-Nr.',
    'Kundenreferenz',
    'Umsatz',
    'Valuta',
    'Vorgang/Verwendungszweck',
    'Währung',
  ];

  if (file.name.match(/Volksbank_(.+)\.csv/)) {
    return true;
  }

  const rawFileString = await readWindowsFile(file);

  if (rawFileString.startsWith('Volksbank eG;;;;;;;;;;;;')) {
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

export const volksbankEG: ParserModule = {
  name: 'Volksbank',
  link: 'https://www.volksbank-eg.de/privatkunden.html',
  match: volksbankMatcher,
  parse: volksbankParser,
};
