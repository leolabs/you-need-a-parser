import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '../..';
import { CellObject } from 'xlsx/types';
import { readToBuffer } from '../../util/read-to-buffer';

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    throw new Error(
      'The input is not a valid date. Expected format: YYYY-MM-DD, got ' + input,
    );
  }

  const [, year, month, day] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const parseNumber = (input: string) => Number(input.replace(',', '')); // , is for thousands separator

export const sebPrivatParser: ParserFunction = async (file: File) => {
  const xlsx = await import('xlsx');
  const workbook = xlsx.read(await readToBuffer(file), {
    type: 'buffer',
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: YnabRow[] = [];

  let rowNum = 9;
  while (true) {
    let dateCol: CellObject | undefined = sheet[`A${rowNum}`];
    if (!dateCol || dateCol.t === 'e' || String(dateCol.v).trim() === '') {
      break;
    }

    rows.push({
      Category: undefined,
      Date: generateYnabDate(String(sheet[`B${rowNum}`].v)),
      Memo: String(sheet[`D${rowNum}`].v)
        .split('\r')[0]
        .trim(),
      Inflow: sheet[`E${rowNum}`].v > 0 ? sheet[`E${rowNum}`].v : undefined,
      Outflow: sheet[`E${rowNum}`].v < 0 ? -sheet[`E${rowNum}`].v : undefined,
    });

    rowNum++;
  }

  return [
    {
      data: rows,
    },
  ];
};

export const sebMatcher: MatcherFunction = async (file: File) => {
  try {
    const xlsx = await import('xlsx');
    const workbook = xlsx.read(await readToBuffer(file), {
      type: 'buffer',
    });

    const cell: CellObject = workbook.Sheets[workbook.SheetNames[0]]['A1'];
    return cell.v === 'Export från internetbanken för privatpersoner';
  } catch (e) {
    return false;
  }
};

export const seb: ParserModule = {
  name: 'SEB Bank',
  country: 'se',
  fileExtension: 'xlsx',
  filenamePattern: /kontoutdrag.xlsx/,
  link: 'https://www.seb.se',
  match: sebMatcher,
  parse: sebPrivatParser,
};
