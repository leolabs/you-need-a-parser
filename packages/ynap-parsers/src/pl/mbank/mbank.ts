import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { readEncodedFile } from '../../util/read-encoded-file';
import { parse } from '../../util/papaparse';

interface mBankRow {
  '#Data operacji': string;
  '#Opis operacji': string;
  '#Rachunek': string;
  '#Kategoria': string;
  '#Kwota': string;
  '#Saldo po operacji': string;
}

const FILE_ENCODING = 'msee';
const AMOUNT_CLEANUP_REGEXP = /[-PLN\s]/g;
const SHEET_CLEANUP_REGEXP = /\s{3,}/g;
const REQUIRED_FIELDS = ['#Data operacji', '#Kwota', '#Opis operacji'];
const PARSER_SETTINGS = {
  header: true,
  delimiter: ';',
  quoteChar: "'",
};

const cleanup = (input: string) => input.replace(SHEET_CLEANUP_REGEXP, '').trim();
const trimMetaData = (input: string) =>
  input.substr(input.indexOf('#Data operacji;'));

export const mbankMatch: MatcherFunction = async (file: File) => {
  const fileString = await readEncodedFile(file, FILE_ENCODING);

  if (fileString.startsWith('mBank S.A.')) {
    return true;
  }

  try {
    const { data } = await parse(trimMetaData(fileString), PARSER_SETTINGS);

    if (data.length === 0) {
      return false;
    }

    const keys = Object.keys(data[0]);
    const missingKeys = REQUIRED_FIELDS.filter(k => !keys.includes(k));

    if (missingKeys.length === 0) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

const mbankParser: ParserFunction = async (file: File) => {
  const fileString = cleanup(
    trimMetaData(await readEncodedFile(file, FILE_ENCODING)),
  );
  const { data } = await parse(fileString, PARSER_SETTINGS);
  const result = data as mBankRow[];

  return [
    {
      data: result
        .filter(item =>
          REQUIRED_FIELDS.every(key => typeof item[key] !== 'undefined'),
        )
        .map(item => {
          const [YYYY, MM, DD] = item['#Data operacji'].split('-');
          const isOutflow = item['#Kwota'].startsWith('-');
          const amount = item['#Kwota']
            .replace(AMOUNT_CLEANUP_REGEXP, '')
            .replace(',', '.');

          return {
            Memo: item['#Opis operacji'],
            Date: [MM, DD, YYYY].join('/'),
            Payee: undefined,
            Outflow: isOutflow ? amount : undefined,
            Inflow: !isOutflow ? amount : undefined,
          };
        }),
    },
  ];
};

export const mbank: ParserModule = {
  name: 'mBank',
  country: 'pl',
  fileExtension: 'csv',
  filenamePattern: /^operations(_\d{6,}){3}\.csv$/,
  link: 'https://www.mbank.pl/',
  match: mbankMatch,
  parse: mbankParser,
};
