import { parse as papaParse, ParseConfig, ParseResult } from 'papaparse';

export const parse = (
  file: File | string,
  config?: ParseConfig,
): Promise<ParseResult> =>
  new Promise((complete, error) => {
    papaParse(file as any, {
      ...config,
      complete,
      error,
    });
  });
