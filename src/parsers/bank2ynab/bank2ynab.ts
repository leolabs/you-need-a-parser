import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '..';
import { parse as parseCsv } from '../../util/papaparse';
import { readEncodedFile } from '../../util/read-encoded-file';
import { parseDate, ynabDate } from './parse-date';

import banks from './banks.json';

export interface ParserConfig {
  filenamePattern: string;
  headerRows: number;
  footerRows: number;
  inputColumns: string[];
  dateFormat?: string;
  name: string;
  link: string;
  country: string;
}

export const parseNumber = (input?: string) =>
  typeof input !== 'undefined'
    ? (input.match(/,/g) || []).length === 1
      ? Number(input.replace(',', '.'))
      : Number(input)
    : undefined;

export const calculateInflow = (inflow?: number, outflow?: number) => {
  if (typeof inflow === 'undefined' && typeof outflow === 'undefined') {
    return undefined;
  }

  if (typeof inflow !== 'undefined' && typeof outflow === 'undefined') {
    return inflow < 0 ? undefined : inflow;
  }

  if (typeof inflow === 'undefined' && typeof outflow !== 'undefined') {
    return outflow < 0 ? -outflow : undefined;
  }

  if (typeof inflow !== 'undefined' && typeof outflow !== 'undefined') {
    throw new Error("Inflow and outflow can't be set simultaneously");
  }
};

export const calculateOutflow = (inflow?: number, outflow?: number) => {
  if (typeof outflow === 'undefined' && typeof inflow === 'undefined') {
    return undefined;
  }

  if (typeof outflow !== 'undefined' && typeof inflow === 'undefined') {
    return outflow < 0 ? undefined : outflow;
  }

  if (typeof outflow === 'undefined' && typeof inflow !== 'undefined') {
    return inflow < 0 ? -inflow : undefined;
  }

  if (typeof outflow !== 'undefined' && typeof inflow !== 'undefined') {
    throw new Error("Inflow and outflow can't be set simultaneously");
  }
};

export const generateParser = (config: ParserConfig) => {
  const columns = config.inputColumns.reduce(
    (acc, cur, index) => {
      if (cur === 'skip') {
        return acc;
      }

      return {
        ...acc,
        [cur]: index,
      };
    },
    {} as { [k in keyof YnabRow]: number },
  );

  const match: MatcherFunction = async (file: File) =>
    !!file.name.match(new RegExp(config.filenamePattern));

  const parse: ParserFunction = async (file: File) => {
    const content = await readEncodedFile(file);
    const { data } = await parseCsv(content);

    const ynabData = data
      .slice(data.length - config.headerRows - config.footerRows + 1)
      .map(d => {
        return {
          Category: columns.Category ? d[columns.Category] : undefined,
          Date: columns.Date
            ? ynabDate(parseDate(d[columns.Date], config.dateFormat))
            : undefined,
          Inflow: calculateInflow(
            columns.Inflow ? parseNumber(d[columns.Inflow]) : undefined,
            columns.Outflow ? parseNumber(d[columns.Outflow]) : undefined,
          ),
          Outflow: calculateOutflow(
            columns.Inflow ? parseNumber(d[columns.Inflow]) : undefined,
            columns.Outflow ? parseNumber(d[columns.Outflow]) : undefined,
          ),
        } as YnabRow;
      });

    return [
      {
        data: ynabData,
      },
    ];
  };

  return {
    name: config.name,
    link: config.link,
    country: config.country,
    match,
    parse,
  } as ParserModule;
};

export const bank2ynab = banks.map(bank => generateParser(bank as ParserConfig));
