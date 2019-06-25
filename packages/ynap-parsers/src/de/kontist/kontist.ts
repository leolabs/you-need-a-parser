import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule } from '../..';
import { parse } from '../../util/papaparse';

export interface KontistRow {
  booking_date: string;
  valuta_date: string;
  amount: string;
  name: string;
  purpose: string;
  end_to_end_id: string;
  booking_status: string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const kontistParser: ParserFunction = async (file: File) => {
  const { data } = await parse(file, { header: true });

  return [
    {
      data: (data as KontistRow[])
        .filter(r => r.booking_date && r.amount)
        .map(r => ({
          Date: generateYnabDate(r.booking_date),
          Payee: r.name,
          Memo: r.purpose,
          Outflow:
            Number(r.amount) < 0 ? (-Number(r.amount) / 100).toFixed(2) : undefined,
          Inflow:
            Number(r.amount) > 0 ? (Number(r.amount) / 100).toFixed(2) : undefined,
        })),
    },
  ];
};

export const kontistMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof KontistRow)[] = [
    'booking_date',
    'valuta_date',
    'name',
    'purpose',
    'end_to_end_id',
    'booking_status',
  ];

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

export const kontist: ParserModule = {
  name: 'Kontist',
  country: 'de',
  fileExtension: 'csv',
  filenamePattern: /^transactions\.csv$/,
  link: 'https://intercom.help/kontist/konto/konto-export-von-kontoauszugen',
  match: kontistMatcher,
  parse: kontistParser,
};
