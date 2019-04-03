import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '..';
import { parse } from '../../util/papaparse';
import { readWindowsFile } from '../../util/read-windows-file';

export interface ComdirectRow {
  Buchungstag: string;
  'Wertstellung (Valuta)': string;
  Vorgang: string;
  Buchungstext: string;
  'Umsatz in EUR': string;
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
  const match = input.match(/"Buchungstag"(.+)"Alter Kontostand"/s);

  if (!match) {
    throw new Error(
      'Metadata could not be trimmed because the file format is incorrect.',
    );
  }

  return `"Buchungstag"${match[1]}`.trim();
};

const postingTextFields = {
  Buchungstext: 'Buchungstext',
  Empfänger: 'Empfänger',
  Auftraggeber: 'Auftraggeber',
  Zahlungspflichtiger: 'Zahlungspflichtiger',
  'Kto/IBAN': 'Kto/IBAN',
  'BLZ/BIC': 'BLZ/BIC',
  Ref: 'Ref',
};

export const extractField = (
  postingText: string,
  field: keyof typeof postingTextFields,
) => {
  // First, split the input by field name
  // so we can remove everything before that.
  const split1 = postingText.split(field);

  if (split1.length < 2) {
    // Field doesn't exist
    return undefined;
  }

  // Next, split the new string again by any possible
  // key so we can remove everything after that.
  const nextField = new RegExp(
    `(${Object.keys(postingTextFields)
      .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})`,
    'i',
  );
  const rawContent = split1[1].split(nextField)[0];

  // Last, trim the content to remove any white spaces
  // or other residue from the previous operations.
  return rawContent.replace(/(^[:.\s]+|\s+$)/g, '');
};

export const comdirectParser: ParserFunction = async (file: File) => {
  const fileString = trimMetaData(await readWindowsFile(file));
  const { data } = await parse(fileString, { header: true });

  return (data as ComdirectRow[])
    .filter(r => r.Buchungstag && r['Umsatz in EUR'])
    .map(r => ({
      Date: generateYnabDate(r.Buchungstag),
      Payee:
        extractField(r.Buchungstext, 'Empfänger') ||
        extractField(r.Buchungstext, 'Zahlungspflichtiger') ||
        extractField(r.Buchungstext, 'Auftraggeber'),
      Memo: extractField(r.Buchungstext, 'Buchungstext'),
      Outflow:
        parseNumber(r['Umsatz in EUR']) < 0
          ? (-parseNumber(r['Umsatz in EUR'])).toFixed(2)
          : undefined,
      Inflow:
        parseNumber(r['Umsatz in EUR']) > 0
          ? parseNumber(r['Umsatz in EUR']).toFixed(2)
          : undefined,
    }));
};

export const comdirectMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof ComdirectRow)[] = [
    'Buchungstag',
    'Wertstellung (Valuta)',
    'Buchungstext',
    'Umsatz in EUR',
    'Vorgang',
  ];

  if (file.name.match(/umsaetze_\d+_[\d-]+\.csv/)) {
    return true;
  }

  const rawFileString = await readWindowsFile(file);

  if (rawFileString.startsWith(';\n"Umsätze Verrechnungskonto')) {
    return true;
  }

  if (rawFileString.length === 0) {
    return false;
  }

  const { data } = await parse(trimMetaData(rawFileString), { header: true });

  if (data.length === 0) {
    return false;
  }

  const keys = Object.keys(data[0]);
  const missingKeys = requiredKeys.filter(k => !keys.includes(k));

  if (missingKeys.length === 0) {
    return true;
  }

  return false;
};

export const comdirect: ParserModule = {
  name: 'comdirect',
  link: 'https://www.comdirect.de',
  match: comdirectMatcher,
  parse: comdirectParser,
};
