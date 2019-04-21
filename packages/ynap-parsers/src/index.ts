import { unparse } from 'papaparse';
import 'mdn-polyfills/String.prototype.padStart';

import uniq from 'lodash/uniq';
import last from 'lodash/last';

import { outbank } from './de/outbank/outbank';
import { n26 } from './de/n26/n26';
import { revolut } from './international/revolut/revolut';
import { ingDiBa } from './de/ing-diba/ing-diba';
import { comdirect } from './de/comdirect/comdirect';
import { kontist } from './de/kontist/kontist';
import { volksbankEG } from './de/volksbank-eg/volksbank-eg';

import { bank2ynab } from './bank2ynab/bank2ynab';
import { bancomer } from './mx/bbva-bancomer/bbva-bancomer';

export interface YnabRow {
  Date?: string;
  Payee?: string;
  Category?: string;
  Memo?: string;
  Outflow?: number | string;
  Inflow?: number | string;
}

export interface YnabFile {
  accountName?: string;
  data: YnabRow[];
}

export interface ParserModule {
  name: string;
  country: string;
  link: string;
  fileExtension: string;
  match: MatcherFunction;
  parse: ParserFunction;
}

export type MatcherFunction = (file: File) => Promise<boolean>;
export type ParserFunction = (file: File) => Promise<YnabFile[]>;

export const parsers: ParserModule[] = [
  outbank,
  n26,
  revolut,
  ingDiBa,
  comdirect,
  kontist,
  volksbankEG,

  bancomer,

  ...bank2ynab,
];

export const countries = uniq(
  parsers.filter(p => p.country.length === 2).map(p => p.country),
);

export const matchFile = async (file: File): Promise<ParserModule[]> => {
  if (file.name.match(/^ynab-(.+)\.csv$/)) {
    throw new Error('This file has already been converted by YNAP.');
  }

  const results = (await Promise.all(
    parsers
      .filter(
        p =>
          p.fileExtension.toLowerCase() === last(file.name.split('.')).toLowerCase(),
      )
      .map(async p => ({
        parser: p,
        matched: await p.match(file),
      })),
  ))
    .filter(r => r.matched)
    .map(p => p.parser);

  if (results.length > 1) {
    console.warn('Found multiple parsers for', file.name);
    console.warn(results.map(r => r.name));
  }

  return results;
};

export const parseFile = async (file: File, parserOverride?: ParserModule) => {
  let parser: ParserModule | null = null;

  if (parserOverride) {
    parser = parserOverride;
  } else {
    const matches = await matchFile(file);
    parser = matches.length > 0 ? matches[0] : null;
  }

  if (!parser) {
    throw new Error(`No parser is available for this file.`);
  }

  const ynabData = await parser.parse(file);

  return ynabData.map(f => ({
    ...f,
    data: unparse(f.data),
    rawData: f.data,
    matchedParser: parser,
  }));
};
