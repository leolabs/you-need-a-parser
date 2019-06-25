import { generateYnabDate, aqua } from './aqua';
import { YnabFile } from '../..';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(__dirname, 'test-data/transactions.csv'));

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '06/06/2019',
        Inflow: '19.87',
        Memo: 'Trainline London GBR',
      },
      {
        Date: '05/27/2019',
        Inflow: undefined,
        Memo: 'PAYMENT RECEIVED - THANK YOU',
        Outflow: '59.64',
      },
    ],
  },
];

describe('Aqua Parser Module', () => {
  describe('Matcher', () => {
    it('should match Aqua files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await aqua.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await aqua.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await aqua.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should convert dates correctly', () => {
      expect(generateYnabDate('01/09/2018')).toEqual('09/01/2018');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
