import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '../..';
import { parse } from '../../util/papaparse';

export interface MarcusRow {
  TransactionDate: string;
  Description: string;
  Value: string;
  AccountBalance: string;
  AccountName: string;
  AccountNumber: string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})(\d{2})(\d{2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYYMMDD');
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const marcusParser: ParserFunction = async (file: File) => {
  const { data } = await parse(file, { header: true });

  const groupedData = (data as MarcusRow[])
    .filter(r => r.TransactionDate && r.Value)
    .reduce(
      (acc, cur) => {
        const row = {
          Date: generateYnabDate(cur.TransactionDate),
          Memo: cur.Description,
          Outflow:
            Number(cur.Value) < 0 ? (-Number(cur.Value)).toFixed(2) : undefined,
          Inflow: Number(cur.Value) > 0 ? Number(cur.Value).toFixed(2) : undefined,
        };

        const key = cur.AccountName || 'no-account';

        if (Object.keys(acc).includes(key)) {
          acc[key].push(row);
        } else {
          acc[key] = [row];
        }

        return acc;
      },
      {} as { [k: string]: YnabRow[] },
    );

  return Object.keys(groupedData).map(key => ({
    accountName: key,
    data: groupedData[key],
  }));
};

export const marcusMatcher: MatcherFunction = async (file: File) => {
  const requiredKeys: (keyof MarcusRow)[] = [
    'TransactionDate',
    'Description',
    'Value',
    'AccountBalance',
    'AccountName',
    'AccountNumber',
  ];

  if (
    file.name.match(/Transactions (.+) (\d{4})-(\d{2})-(\d{2}) (\d{2})_(\d{2})\.csv/)
  ) {
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

export const marcus: ParserModule = {
  name: 'Marcus',
  country: 'uk',
  fileExtension: 'csv',
  link: 'https://www.marcus.co.uk/uk/en',
  match: marcusMatcher,
  parse: marcusParser,
};
