import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabFile } from '../..';
import { parse } from '../../util/papaparse';

export interface N26Row {
  // Fields common to all formats
  'Amount (EUR)': string;

  // Fields for old formats (until 2021)
  Date?: string;
  Payee?: string;
  'Transaction type'?: string;
  'Payment reference'?: string;
  Category?: string;
  'Amount (Foreign Currency)'?: string;
  'Type Foreign Currency'?: string;
  'Exchange Rate'?: string;

  // Fields for formats since 2022
  // (If any new fields were introduced, they would be added here)

  // Fields for 2024 format
  'Booking Date'?: string;
  'Value Date'?: string;
  'Partner Name'?: string;
  'Partner Iban'?: string;
  Type?: string;
  'Payment Reference'?: string;
  'Account Name'?: string;
  'Original Amount'?: string;
  'Original Currency'?: string;
  // 'Amount (EUR)' is already included
  // 'Exchange Rate' is already included
}

export const generateYnabDate = (input: string): string => {
  // Handle both date formats: 'YYYY-MM-DD' and 'DD.MM.YYYY'
  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${month}/${day}/${year}`;
  }

  const deMatch = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (deMatch) {
    const [, day, month, year] = deMatch;
    return `${month}/${day}/${year}`;
  }

  throw new Error('The input is not a valid date. Expected formats: YYYY-MM-DD or DD.MM.YYYY');
};

export const n26Parser: ParserFunction = async (file: File): Promise<YnabFile[]> => {
  const { data } = await parse(file, { header: true });

  const transactions = (data as N26Row[])
  .filter((r) => (r.Date || r['Booking Date']) && r['Amount (EUR)'])
  .map((r) => {
    let date = '';
    let payee = '';
    let memo = '';
    let category: string | undefined = undefined;

    const isOldFormat = Boolean(r.Date);
    const isNewFormat = Boolean(r['Booking Date']);

      // Determine the format
    if (isOldFormat) {
        // Old format
      date = r.Date;
      payee = r.Payee || '';
      memo = r['Payment reference'] || '';
      category = r.Category || undefined;
    } else if (isNewFormat) {
        // 2024 format
      date = r['Booking Date'];
      payee = r['Partner Name'] || '';
      memo = r['Payment Reference'] || '';
        // No category in 2024 format
    } else {
        // Unknown format
      throw new Error('Unknown transaction format');
    }

    return {
      Date: generateYnabDate(date),
      Payee: payee,
      Category: category,
      Memo: memo,
      Outflow: Number(r['Amount (EUR)']) < 0 ? Math.abs(Number(r['Amount (EUR)'])).toFixed(2) : undefined,
      Inflow: Number(r['Amount (EUR)']) > 0 ? Number(r['Amount (EUR)']).toFixed(2) : undefined,
    };
  });

  return [{ data: transactions }];
};

export const n26Matcher: MatcherFunction = async (file: File): Promise<boolean> => {
  const { data } = await parse(file, { header: true });

  if (data.length === 0) {
    return false;
  }

  const keys = Object.keys(data[0]);

  // Check for old format headers
  const oldFormatHeaders = ['Date', 'Payee', 'Transaction type', 'Payment reference', 'Amount (EUR)'];
  const isOldFormat = oldFormatHeaders.every((header) => keys.includes(header));

  // Check for 2024 format headers
  const format2024Headers = ['Booking Date', 'Partner Name', 'Type', 'Payment Reference', 'Amount (EUR)'];
  const isFormat2024 = format2024Headers.every((header) => keys.includes(header));

  return isOldFormat || isFormat2024;
};

export const n26: ParserModule = {
  name: 'N26',
  country: 'de',
  fileExtension: 'csv',
  filenamePattern: /^n26-csv-transactions\.csv$|^[A-Za-z0-9_]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}\.csv$/i,
  link: 'https://support.n26.com/en-eu/payments-transfers-and-withdrawals/payments-and-transfers/how-to-export-a-list-of-my-transactions',
  match: n26Matcher,
  parse: n26Parser,
};