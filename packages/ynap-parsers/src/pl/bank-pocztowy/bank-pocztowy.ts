import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { readEncodedFile } from '../../util/read-encoded-file';
import { parse } from '../../util/papaparse';

type bankPocztowyRow = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export const FILE_ENCODING = 'windows1250';
const DATE_REGEXP = /\d{4}\s\d{2}\s\d{2}/;
const ACCOUNT_NUMBER_REGEXP = /\d{2}1320\d{20}/;
const AMOUNT_CLEANUP_REGEXP = /[-PLN\s]/g;
const PAYEE_REGEXP = /\d{26},(\d{26}|(\d{1,}-){1,}\d),(.+?),-?\d{1,}\.\d{2},PLN/g;
const NEW_LINE_REGEXP = /\|/g;
const PARSER_SETTINGS = {
  header: false,
  delimiter: ',',
  quoteChar: '"',
};

const fixInput = (input: string) =>
  input
    .trim()
    .split(/\n/)
    .map(line =>
      line.replace(PAYEE_REGEXP, (match, a, b, payee) =>
        match.replace(payee, payee.replace(/,/g, '__')),
      ),
    )
    .join('\n');

const bankPocztowyMatch: MatcherFunction = async (file: File) => {
  const fileString = await readEncodedFile(file, FILE_ENCODING);

  try {
    const { data } = await parse(fixInput(fileString), PARSER_SETTINGS);
    const [row] = data;

    if (data.length === 0) {
      return false;
    }

    if (row.length !== 9) {
      return false;
    }

    if (
      row[0].match(DATE_REGEXP) &&
      row[1].match(DATE_REGEXP) &&
      row[2].match(ACCOUNT_NUMBER_REGEXP)
    ) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

const bankPocztowyParser: ParserFunction = async (file: File) => {
  const fileString = await readEncodedFile(file, FILE_ENCODING);
  const { data } = await parse(fixInput(fileString), PARSER_SETTINGS);
  const result = data as bankPocztowyRow[];

  return [
    {
      data: result
        .filter(item => item.length === 9)
        .map(item => {
          const [YYYY, MM, DD] = item[0].split(' ');
          const isOutflow = item[5].startsWith('-');
          const amount = item[5]
            .replace(AMOUNT_CLEANUP_REGEXP, '')
            .replace(',', '.');

          return {
            Memo: item[7].replace(NEW_LINE_REGEXP, ''),
            Date: [MM, DD, YYYY].join('/'),
            Payee: undefined,
            Outflow: isOutflow ? amount : undefined,
            Inflow: !isOutflow ? amount : undefined,
          };
        }),
    },
  ];
};

export const bankPocztowy: ParserModule = {
  name: 'Bank Pocztowy',
  country: 'pl',
  fileExtension: 'csv',
  filenamePattern: /^\d{13}\.csv$/,
  link: 'https://www.pocztowy.pl',
  match: bankPocztowyMatch,
  parse: bankPocztowyParser,
};
