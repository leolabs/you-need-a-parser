import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../../util/papaparse';

export interface N26Row {
  Date: string;
  Payee: string;
  'Account number': string;
  'Transaction type': string;
  'Payment reference': string;
  Category: string;
  'Amount (EUR)': string;
  'Amount (Foreign Currency)': string;
  'Type Foreign Currency': string;
  'Exchange Rate': string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const n26Parser: ParserFunction = async (file: File) => {
  const { data } = await parse(file, { header: true });

  return (data as N26Row[])
    .filter(r => r.Date && r['Amount (EUR)'])
    .map(r => ({
      Date: generateYnabDate(r.Date),
      Payee: r.Payee,
      Category: r.Category,
      Memo: r['Payment reference'],
      Outflow:
        Number(r['Amount (EUR)']) < 0
          ? Math.abs(Number(r['Amount (EUR)'])).toFixed(2)
          : undefined,
      Inflow:
        Number(r['Amount (EUR)']) > 0
          ? Number(r['Amount (EUR)']).toFixed(2)
          : undefined,
    }));
};

export const n26Matcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof N26Row)[] = [
    'Date',
    'Payee',
    'Account number',
    'Transaction type',
    'Payment reference',
    'Category',
    'Amount (EUR)',
  ];

  if (file.name.startsWith('n26-csv-transactions')) {
    return true;
  }

  const { data } = await parse(file, { header: true });

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

export const n26: ParserModule = {
  name: 'N26',
  link:
    'https://support.n26.com/en-eu/fixing-an-issue/payments-and-transfers/how-to-export-a-list-of-my-transactions',
  match: n26Matcher,
  parse: n26Parser,
};
