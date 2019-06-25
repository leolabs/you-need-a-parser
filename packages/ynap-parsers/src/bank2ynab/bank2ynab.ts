import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '..';
import { parse as parseCsv } from '../util/papaparse';
import { readEncodedFile } from '../util/read-encoded-file';
import { parseDate, ynabDate } from './parse-date';
import { ParserConfig } from 'ynap-bank2ynab-converter/parserconfig';

import banks from './banks.json';

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

  const match: MatcherFunction = async (file: File) => {
    const content = await readEncodedFile(file);
    const { data } = await parseCsv(content);

    const match = file.name.match(new RegExp(config.filenamePattern));
    return match && data.length > 0 && data[0].length >= config.inputColumns.length;
  };

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
    filenamePattern: new RegExp(config.filenamePattern),
    fileExtension: config.filenameExtension || 'csv',
    match,
    parse,
  } as ParserModule;
};

const blacklist = ['de N26', 'de ING-DiBa'];
export const bank2ynab = banks
  .filter(b => !blacklist.includes(`${b.country} ${b.name}`))
  .map(bank => generateParser(bank as ParserConfig));
