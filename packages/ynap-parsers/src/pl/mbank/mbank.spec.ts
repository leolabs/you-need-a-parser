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

describe('mBank Parser Module', () => {
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

    it('should properly escape quote characters', async () => {
      const content = [
        '#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;#Saldo po operacji;',
        '2019-09-25;INCOME;eKonto 0000 ... 1111;Wpływy - inne;2 000,00 PLN;2 867,35 PLN',
        '2019-09-22;"QUOTED" Name.;eKonto 0000 ... 1111;Wydatki - inne;-18,39 PLN;4 684,40 PLN',
        '2019-09-25;INCOME;eKonto 0000 ... 1111;Wpływy - inne;2 000,00 PLN;2 867,35 PLN',
      ].join('\r\n');
      const file = new File([iconv.encode(content, 'msee')], 'test.csv');
      const result = await mbank.parse(file);

      expect(result[0].data).toHaveLength(3);
      expect(result[0].data[1].Memo).toBe('"QUOTED" Name.');
    });

    it('should parse uncleared transactions', async () => {
      const content = [
        '#Data operacji;#Opis operacji;#Rachunek;#Kategoria;#Kwota;#Saldo po operacji;',
        '2019-09-25;INCOME;eKonto 0000 ... 1111;Wpływy - inne;2 000,00 PLN;2 867,35 PLN',
        '2019-09-22;"QUOTED" Name.',
        '           transakcja nierozliczona  ',
        '   ;eKonto 0000 ... 1111;Wydatki - inne;-18,39 PLN;4 684,40 PLN',
        '2019-09-25;INCOME;eKonto 0000 ... 1111;Wpływy - inne;2 000,00 PLN;2 867,35 PLN',
      ].join('\r\n');
      const file = new File([iconv.encode(content, 'msee')], 'test.csv');
      const result = await mbank.parse(file);

      expect(result[0].data).toHaveLength(3);
    });
  });
});
