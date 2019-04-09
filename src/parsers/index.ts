import { unparse } from 'papaparse';
import 'mdn-polyfills/String.prototype.padStart';

import uniq from 'lodash/uniq';

import { outbank } from './de/outbank/outbank';
import { n26 } from './de/n26/n26';
import { ingDiBa } from './de/ing-diba/ing-diba';
import { comdirect } from './de/comdirect/comdirect';
import { kontist } from './de/kontist/kontist';
import { volksbankEG } from './de/volksbank-eg/volksbank-eg';

import { bank2ynab } from './bank2ynab/bank2ynab';

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
  match: MatcherFunction;
  parse: ParserFunction;
}

export type MatcherFunction = (file: File) => Promise<boolean>;
export type ParserFunction = (file: File) => Promise<YnabFile[]>;

export const parsers: ParserModule[] = [
  outbank,
  n26,
  ingDiBa,
  comdirect,
  kontist,
  volksbankEG,

  ...bank2ynab,
];

export const countries = uniq(
  parsers.filter(p => p.country.length === 2).map(p => p.country),
);

export const matchFile = async (file: File) => {
  const results = (await Promise.all(
    parsers.map(async p => ({
      parser: p,
      matched: await p.match(file),
    })),
  )).filter(r => r.matched);

  if (results.length === 0) {
    return null;
  }

  if (results.length > 1) {
    console.warn('Found multiple parsers for', file.name);
    console.warn(results.map(r => r.parser.name));
  }

  return results[0].parser;
};

export const parseFile = async (file: File, parserOverride?: ParserModule) => {
  const parser = parserOverride || (await matchFile(file));

  if (!parser) {
    throw new Error(`No parser is available for this file.`);
  }

  const ynabData = await parser.parse(file);

  return ynabData.map(f => ({
    ...f,
    data: unparse(f.data),
    matchedParser: parser,
  }));
};
