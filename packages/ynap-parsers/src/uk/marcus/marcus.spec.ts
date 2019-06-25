import { generateYnabDate, marcus } from './marcus';
import { YnabFile } from '../..';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(
  path.join(
    __dirname,
    'test-data/Transactions [Account Number] 2019-06-12 13_40.csv',
  ),
);

const ynabResult: YnabFile[] = [
  {
    accountName: 'Online Savings Account',
    data: [
      {
        Date: '06/01/2019',
        Memo: 'Interest applied',
        Inflow: '1.41',
        Outflow: undefined,
      },
      {
        Date: '05/24/2019',
        Memo: 'Transfer from REDACTED',
        Inflow: '588.47',
        Outflow: undefined,
      },
    ],
  },
  {
    accountName: 'Online Savings Account 2',
    data: [
      {
        Date: '05/05/2019',
        Memo: 'Transfer from REDACTED',
        Inflow: '475.80',
        Outflow: undefined,
      },
      {
        Date: '05/01/2019',
        Memo: 'Transfer from REDACTED',
        Inflow: '500.00',
        Outflow: undefined,
      },
    ],
  },
];

describe('Marcus Parser Module', () => {
  describe('Matcher', () => {
    it('should match Marcus files by name', async () => {
      const fileName = 'Transactions [Account Number] 2019-06-12 13_40.csv';
      const result = !!fileName.match(marcus.filenamePattern);
      expect(result).toBe(true);
    });

    it('should match Marcus files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await marcus.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await marcus.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await marcus.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should convert dates correctly', () => {
      expect(generateYnabDate('20180901')).toEqual('09/01/2018');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
