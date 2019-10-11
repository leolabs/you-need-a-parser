import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

import { YnabFile } from '../..';
import { mbank } from './mbank';

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '10/09/2019',
        Payee: undefined,
        Memo: 'OUTCOME',
        Outflow: '30.00',
        Inflow: undefined,
      },
      {
        Date: '09/25/2019',
        Payee: undefined,
        Memo: 'INCOME',
        Outflow: undefined,
        Inflow: '2000.00',
      },
    ],
  },
];

describe.only('mBank Parser Module', () => {
  describe('Matcher', () => {
    it('should match mBank files by file name', async () => {
      const fileName = 'operations_190710_191010_201910100004038185.csv';
      const result = !!fileName.match(mbank.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await mbank.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match mBank files by fields', async () => {
      const content = fs.readFileSync(
        path.resolve(
          __dirname,
          'test-data',
          'operations_190710_191010_201910100004038185.csv',
        ),
      );
      const file = new File([iconv.decode(content, 'msee')], 'test.csv');
      const result = await mbank.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await mbank.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const content = fs.readFileSync(
        path.resolve(
          __dirname,
          'test-data',
          'operations_190710_191010_201910100004038185.csv',
        ),
      );
      const file = new File([content], 'test.csv');
      const result = await mbank.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });
});
