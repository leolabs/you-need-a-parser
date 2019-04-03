import { unparse } from 'papaparse';
import 'mdn-polyfills/String.prototype.padStart';

import { outbank } from './outbank';
import { n26 } from './n26';
import { ingDiBa } from './ing-diba';
import { comdirect } from './comdirect';

export interface YnabRow {
  Date?: string;
  Payee?: string;
  Category?: string;
  Memo?: string;
  Outflow?: string;
  Inflow?: string;
}

export interface ParserModule {
  name: string;
  link: string;
  match: MatcherFunction;
  parse: ParserFunction;
}

export type MatcherFunction = (file: File) => Promise<boolean>;
export type ParserFunction = (file: File) => Promise<YnabRow[]>;

export const parserMap: { [k: string]: ParserModule } = {
  outbank,
  n26,
  ingDiBa,
  comdirect,
};

export const matchFile = async (file: File) => {
  for (const parser of Object.values(parserMap)) {
    if (await parser.match(file)) {
      return parser;
    }
  }

  return null;
};

export const parseFile = async (file: File, parserOverride?: ParserModule) => {
  const parser = parserOverride || (await matchFile(file));

  if (!parser) {
    throw new Error(`No parser is available for this file.`);
  }

  const ynabData = await parser.parse(file);

  return {
    data: unparse(ynabData),
    matchedParser: parser,
  };
};
