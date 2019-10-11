import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '..';
import { readToBuffer } from '../util/read-to-buffer';
import { YnabFile } from '../';

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error('The input is not a valid date. Expected format: YYYY-MM-DD');
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const mt940matcher: MatcherFunction = async file => {
  const mt = await import('mt940-js');
  const buffer = await readToBuffer(file);

  try {
    const res = await mt.read(buffer);
    return res.length > 0;
  } catch {}

  return false;
};

export const mt940parser: ParserFunction = async file => {
  const mt = await import('mt940-js');
  const buffer = await readToBuffer(file);
  const statements = await mt.read(buffer);

  return statements.map(
    s =>
      ({
        accountName: [s.referenceNumber, s.accountId].filter(Boolean).join(' '),
        data: s.transactions.map(
          t =>
            ({
              Inflow: t.isCredit ? t.amount : undefined,
              Outflow: t.isCredit ? undefined : t.amount,
              Date: generateYnabDate(t.entryDate),
              Memo: t.description,
            } as YnabRow),
        ),
      } as YnabFile),
  );
};

export const mt940: ParserModule = {
  name: 'MT940 (standard)',
  link: 'https://en.wikipedia.org/wiki/MT940',
  country: 'international',
  fileExtension: 'sta',
  filenamePattern: /(.*)\.sta$/,
  match: mt940matcher,
  parse: mt940parser,
};
