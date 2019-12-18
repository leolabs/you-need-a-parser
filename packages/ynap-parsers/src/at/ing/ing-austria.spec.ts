import { generateYnabDate, ingAustria } from './ing-austria';
import { YnabFile } from '../..';
import { encode } from 'iconv-lite';

const content = encode(
  `IBAN;Text;Valutadatum;Währung;Soll;Haben
  AT483200000012345864;Outflow from Max Mustermann;01.12.2019;EUR;100,01;0,00
  AT483200000012345864;Inflow from John Doe;02.12.2019;EUR;0,00;200,01`,
  'ISO-8859-1',
);

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '12/01/2019',
        Payee: 'Outflow from Max Mustermann',
        Memo: undefined,
        Outflow: '100.01',
        Inflow: undefined,
      },
      {
        Date: '12/02/2019',
        Payee: 'Inflow from John Doe',
        Memo: undefined,
        Outflow: undefined,
        Inflow: '200.01',
      },
    ],
  },
];

describe('ING Austria Parser Module', () => {
  describe('Matcher', () => {
    it('should match ING Austria files by file name', async () => {
      const fileName = 'ING_Umsaetze.csv';
      const result = !!fileName.match(ingAustria.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await ingAustria.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match ING Austria files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await ingAustria.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await ingAustria.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await ingAustria.parse(file);
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
