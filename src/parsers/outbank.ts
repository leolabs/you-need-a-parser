import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '.';

interface OutbankRow {
  '#': string;
  Account?: string;
  Date?: string;
  'Value Date'?: string;
  Amount?: string;
  Currency?: string;
  Name?: string;
  Number?: string;
  Bank?: string;
  Reason?: string;
  Category?: string;
  Subcategory?: string;
  Tags?: string;
  Note?: string;
  'Bank name'?: string;
  'Ultimate Receiver Name'?: string;
  'Original Amount'?: string;
  'Compensation Amount'?: string;
  'Exchange Rate'?: string;
  'Posting Key'?: string;
  'Posting Text'?: string;
  'Purpose Code'?: string;
  'SEPA Reference'?: string;
  'Client Reference'?: string;
  'Mandate Identification'?: string;
  'Originator Identifier'?: string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{1,2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: M/D/Y');
  }

  console.log(match);

  const [, month, day, year] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), `20${year}`].join('/');
};

export const parseNumber = (input: string = '0') => Number(input.replace(',', '.'));

export const outbankParser: ParserFunction = async (data: OutbankRow[]) => {
  return (data as OutbankRow[])
    .filter(d => d.Date && d.Amount)
    .map(r => ({
      Date: generateYnabDate(r.Date!),
      Payee: r.Name,
      Category: r.Category,
      Memo: r.Reason,
      Outflow:
        parseNumber(r.Amount) < 0
          ? Math.abs(parseNumber(r.Amount)).toFixed(2)
          : undefined,
      Inflow:
        parseNumber(r.Amount) > 0 ? parseNumber(r.Amount).toFixed(2) : undefined,
    }));
};

export const outbankMatcher: MatcherFunction = async (
  file: File,
  data: OutbankRow[],
) => {
  const requiredKeys = [
    '#',
    'Account',
    'Date',
    'Value Date',
    'Amount',
    'Currency',
    'Name',
    'Number',
    'Bank',
    'Reason',
    'Category',
  ];

  if (file.name.startsWith('Outbank_Export_')) {
    return true;
  }

  const keys = Object.keys(data[0]);
  const missingKeys = requiredKeys.filter(k => !keys.includes(k));

  if (missingKeys.length === 0) {
    return true;
  }

  return false;
};

export const outbank: ParserModule = {
  name: 'Outbank',
  matcher: outbankMatcher,
  parser: outbankParser,
};
