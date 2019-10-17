import fs from 'fs';
import path from 'path';
import { generateYnabDate, sparbankenTanum } from './sparbanken-tanum';
import { YnabRow, YnabFile } from '../../..';

const content = fs.readFileSync(path.join(__dirname, 'test-data', 'export.csv'));

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '07/19/2019',
        Inflow: undefined,
        Outflow: '1.00',
        Payee: 'Övf via internet',
      },
      {
        Date: '07/19/2019',
        Inflow: undefined,
        Outflow: '10.00',
        Payee: 'ITUNES.COM/BILL',
      },
    ],
  },
];

describe('Sparbanken Tanum Parser Module', () => {
  describe('Matcher', () => {
    it('should match Sparbanken Tanum files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await sparbankenTanum.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await sparbankenTanum.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await sparbankenTanum.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should convert dates correctly', () => {
      expect(generateYnabDate('2018-09-01')).toEqual('09/01/2018');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
