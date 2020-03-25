import { generateYnabDate, _1822direkt } from './1822direkt';
import fs from 'fs';
import path from 'path';
import { YnabFile } from '../..';

const content = fs.readFileSync(
  path.join(__dirname, 'test-data', 'umsaetze-12345678-25.03.2020_11_45.csv'),
);

const ynabResult: YnabFile[] = [
  {
    accountName: '12345678',
    data: [
      {
        Date: '03/25/2020',
        Payee: 'PayPal (Europe) S.a.r.l. et Cie., S.C.A.',
        Memo: 'PP.1494.PP . DOMINOSPIZZ, Ihr Einkauf bei DOMINOSPIZZ',
        Outflow: '19.99',
        Inflow: undefined,
      },
      {
        Date: '03/23/2020',
        Payee: 'DIRK ROSSMANN GMBH//ORTSNAME/DE',
        Memo: 'SVWZ+2020-03-20T09:10 Debitk.4 2022-12',
        Outflow: '2.37',
        Inflow: undefined,
      },
      {
        Date: '03/23/2020',
        Payee: 'REWE SAGT DANKE. 43400092//Ortsname/DE',
        Memo: 'SVWZ+2020-03-20T08:50 Debitk.4 2022-12',
        Outflow: '19.95',
        Inflow: undefined,
      },
    ],
  },
];

describe('1822direkt Parser Module', () => {
  describe('Matcher', () => {
    it('should match 1822direkt files by file name', async () => {
      const fileName = 'umsaetze-12345678-25.03.2020_11_45.csv';
      const result = !!fileName.match(_1822direkt.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await _1822direkt.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match 1822direkt files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await _1822direkt.match(file);
      expect(result).toBe(true);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await _1822direkt.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should format an input date correctly', () => {
      expect(generateYnabDate('03.05.2018')).toEqual('05/03/2018');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
