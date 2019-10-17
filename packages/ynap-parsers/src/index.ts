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

import { bancomer } from './mx/bbva-bancomer/bbva-bancomer';
import { piraeus } from './gr/piraeus/piraeus';
import { marcus } from './uk/marcus/marcus';
import { aqua } from './uk/aqua/aqua';

import { bank2ynab } from './bank2ynab/bank2ynab';
import { sparbankenTanum } from './se/sparbanken-tanum/sparbanken-tanum';
import { mt940 } from './international/mt940/mt940';

import { mbank } from './pl/mbank/mbank';

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
  filenamePattern: RegExp;
  match: MatcherFunction;
  parse: ParserFunction;
}

export type MatcherFunction = (file: File) => Promise<boolean>;
export type ParserFunction = (file: File) => Promise<YnabFile[]>;

export const parsers: ParserModule[] = [
  // DE
  outbank,
  n26,
  ingDiBa,
  comdirect,
  kontist,
  volksbankEG,

  // GR
  piraeus,

  // MX
  bancomer,

  // SE
  sparbankenTanum,

  // UK
  marcus,
  aqua,

  // PL
  mbank,

  // International
  revolut,
  mt940,
  ...bank2ynab,
];

export const countries = uniq(
  parsers.filter(p => p.country.length === 2).map(p => p.country),
);

export const matchFile = async (file: File): Promise<ParserModule[]> => {
  if (file.name.match(/^(.+)-ynap\.csv$/)) {
    throw new Error('This file has already been converted by YNAP.');
  }

  const filenameMatches = parsers.filter(p => file.name.match(p.filenamePattern));

  // If parser modules match the file by its filename, try those first
  if (filenameMatches.length > 0) {
    const parsers = (await Promise.all(
      filenameMatches.map(async p => ({
        parser: p,
        matched: await p.match(file),
      })),
    ))
      .filter(r => r.matched)
      .map(p => p.parser);

    if (parsers.length > 0) {
      return parsers;
    }
  }

  // If they don't, run all matchers against the input file
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

  return results;
};

export const parseFile = async (file: File, parserOverride?: ParserModule) => {
  let parser: ParserModule | null = null;

  if (parserOverride) {
    parser = parserOverride;
  } else {
    const matches = await matchFile(file);
    console.log(
      'The file',
      file.name,
      'was matched by',
      matches.map(m => m.name).join(', '),
    );
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
