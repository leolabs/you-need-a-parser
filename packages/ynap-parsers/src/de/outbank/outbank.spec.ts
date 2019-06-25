import { generateYnabDate, outbank } from './outbank';
import { YnabFile } from '../..';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(
  path.join(__dirname, 'test-data/Outbank_Export_20190403.csv'),
);

const ynabResult: YnabFile[] = [
  {
    accountName: 'ing-diba-frankfurt-am-main',
    data: [
      {
        Date: '04/02/2019',
        Payee: 'SHELL',
        Category: 'Travel',
        Memo: 'SHELL',
        Outflow: '44.98',
        Inflow: undefined,
      },
      {
        Date: '04/02/2019',
        Payee: 'Musikschule',
        Category: '',
        Memo: 'Gesang',
        Outflow: '109.00',
        Inflow: undefined,
      },
    ],
  },
];

describe('Outbank Parser Module', () => {
  describe('Matcher', () => {
    it('should match Outbank files by file name', async () => {
      const fileName = 'Outbank_Export_20190403.csv';
      const result = !!fileName.match(outbank.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await outbank.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match Outbank files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await outbank.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await outbank.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await outbank.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
