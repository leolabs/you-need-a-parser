import { parse as papaParse, ParseConfig, ParseResult } from 'papaparse';

export const parse = (file: File, config?: ParseConfig): Promise<ParseResult> =>
  new Promise((complete, error) => {
    papaParse(file, {
      ...config,
      complete,
      error,
    });
  });
