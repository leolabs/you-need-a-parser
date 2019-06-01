import 'mdn-polyfills/String.prototype.startsWith';
import { ParserFunction, MatcherFunction, ParserModule, YnabRow } from '../..';
import { CellObject } from 'xlsx/types';
import { readToBuffer } from '../../util/read-to-buffer';

export const generateYnabDate = (input: string) => {
  const match = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  if (!match) {
    throw new Error(
      'The input is not a valid date. Expected format: DD/MM/YYYY, got ' + input,
    );
  }

  const [, day, month, year] = match;
  return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
};

export const parseNumber = (input: string) => Number(input.replace(',', '.'));

export const piraeusParser: ParserFunction = async (file: File) => {
  const xlsx = await import('xlsx');
  const workbook = xlsx.read(await readToBuffer(file), {
    type: 'buffer',
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: YnabRow[] = [];

  let rowNum = 7;
  while (true) {
    let category: CellObject | undefined = sheet[`A${rowNum}`];
    if (!category || category.t === 'e' || String(category.v).trim() === '') {
      break;
    }

    rows.push({
      Category: String(category.v),
      Date: generateYnabDate(String(sheet[`C${rowNum}`].v)),
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

export const piraeusMatcher: MatcherFunction = async (file: File) => {
  if (file.name.match(/Account Transactions_\d{8}\.xlsx/)) {
    return true;
  }

  try {
    const xlsx = await import('xlsx');
    const workbook = xlsx.read(await readToBuffer(file), {
      type: 'buffer',
    });

    const cell: CellObject = workbook.Sheets[workbook.SheetNames[0]]['A1'];
    return cell.v === 'Piraeus Bank';
  } catch (e) {
    return false;
  }
};

export const piraeus: ParserModule = {
  name: 'Piraeus Bank',
  country: 'gr',
  fileExtension: 'xlsx',
  link: 'https://www.piraeusbank.gr',
  match: piraeusMatcher,
  parse: piraeusParser,
};
