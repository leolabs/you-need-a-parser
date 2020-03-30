import { generateYnabDate, seb } from './seb';
import { YnabFile } from '../..';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(
  path.join(__dirname, 'test-data/kontoutdrag.xlsx'),
);

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        "Category": undefined,
        'Date': '03/30/2020',
        'Inflow': 875.63,
        'Memo': 'VOLVOCARD',
        'Outflow': undefined,
      },
      {
        'Category': undefined,
        'Date': '03/29/2020',
        'Inflow': undefined,
        'Memo': 'BLOCKET AB',
        'Outflow': 125,
      }
    ],
  },
];

describe('SEB Bank Parser Module', () => {
  describe('Matcher', () => {
    it('should match SEB Bank files by file name', async () => {
      const fileName = 'kontoutdrag.xlsx';
      const result = !!fileName.match(seb.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.xlsx');
      const result = await seb.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match SEB Bank files by fields', async () => {
      const file = new File([content], 'test.xlsx');
      const result = await seb.match(file);
      expect(result).toBe(true);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.xlsx');
      const result = await seb.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should format an input date correctly', () => {
      expect(generateYnabDate('2020-30-03')).toEqual('30/03/2020');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
