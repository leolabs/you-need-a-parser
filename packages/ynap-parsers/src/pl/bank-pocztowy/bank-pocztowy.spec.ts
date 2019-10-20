import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

import { YnabFile } from '../..';
import { bankPocztowy, FILE_ENCODING } from './bank-pocztowy';

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '10/11/2019',
        Payee: undefined,
        Memo: 'OUTCOME 0232-333',
        Outflow: '1008.03',
        Inflow: undefined,
      },
      {
        Date: '10/11/2019',
        Payee: undefined,
        Memo: 'INCOME',
        Outflow: undefined,
        Inflow: '1000.00',
      },
      {
        Date: '10/09/2019',
        Payee: undefined,
        Memo: 'Opłata za kartę nr:9988 44xx xxxx 3333za okres  09.2019',
        Outflow: '5.00',
        Inflow: undefined,
      },
    ],
  },
];

describe('Bank Pocztowy Parser Module', () => {
  describe('Matcher', () => {
    it('should match bank pocztowy files by file name', async () => {
      const fileName = '1571076127593.csv';
      const result = !!fileName.match(bankPocztowy.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await bankPocztowy.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match bankPocztowy files by fields', async () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, 'test-data', '1571076127593.csv'),
      );
      const file = new File([iconv.decode(content, FILE_ENCODING)], 'test.csv');
      const result = await bankPocztowy.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await bankPocztowy.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, 'test-data', '1571076127593.csv'),
      );
      const file = new File([content], '1571076127593.csv');
      const result = await bankPocztowy.parse(file);

      expect(result).toEqual(ynabResult);
    });
  });
});
