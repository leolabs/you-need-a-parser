import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '../../..';
import { parse } from '../../../util/papaparse';
import { readEncodedFile } from '../../../util/read-encoded-file';

export interface Row {
  Radnummer: string;
  Clearingnummer: string;
  Kontonummer: string;
  Produkt: string;
  Valuta: string;
  Bokföringsdag: string;
  Transaktionsdag: string;
  Valutadag: string;
  Referens: string;
  Beskrivning: string;
  Belopp: string;
  'Bokfört saldo': string;
}

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const trimMeta = (input: string) => input.substr(input.indexOf('Radnummer'));

export const sparbankenTanumParser: ParserFunction = async (file: File) => {
  const { data } = await parse(trimMeta(await readEncodedFile(file)), {
    header: true,
  });

  const groupedData = (data as Row[])
    .filter(r => r.Radnummer && r.Belopp)
    .reduce(
      (acc, cur) => {
        const amount = Number(cur.Belopp);
        const data = {
          Date: generateYnabDate(cur.Transaktionsdag),
          Payee: cur.Referens,
          Category: cur.Beskrivning,
          Outflow: amount < 0 ? Math.abs(amount).toFixed(2) : undefined,
          Inflow: amount > 0 ? amount.toFixed(2) : undefined,
        };

        const key = [cur.Produkt, cur.Kontonummer].filter(Boolean).join('-');

        if (Object.keys(acc).includes(key)) {
          acc[key].push(data);
        } else {
          acc[key] = [data];
        }

        return acc;
      },
      {} as Record<string, YnabRow[]>,
    );

  return Object.keys(groupedData).map(key => ({
    accountName: key,
    data: groupedData[key],
  }));
};

export const sparbankenTanumMatcher: MatcherFunction = async (file: File) => {
  const { data } = await parse(trimMeta(await readEncodedFile(file)), {
    header: true,
  });

  // Check if the file contains any data
  if (data.length === 0) {
    return false;
  }

  // Check if the first date field is a date
  if (!String((data[0] as Row).Bokföringsdag).match(/\d{4}-\d{2}-\d{2}/)) {
    return false;
  }

  // Check if the fourth field is a valid number
  if (!String((data[0] as Row).Belopp).match(/-?\d+\.\d{2}/)) {
    return false;
  }

  return true;
};

export const sparbankenTanum: ParserModule = {
  name: 'Sparbanken Tanum (2019)',
  country: 'se',
  fileExtension: 'csv',
  filenamePattern: /^Transaktioner_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/,
  link: 'https://www.sparbankentanum.se/',
  match: sparbankenTanumMatcher,
  parse: sparbankenTanumParser,
};
