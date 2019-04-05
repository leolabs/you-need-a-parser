import { generateYnabDate, kontist } from './kontist';
import { YnabRow } from '../..';

const content = `booking_date,valuta_date,amount,name,purpose,end_to_end_id,booking_status
2018-07-19,2018-07-19,-18000,John Doe,Invoice 2018006,E-e5a5084f898385ba8bc869c9627d8d2,processed
2018-07-19,2018-07-19,55800,Company,LB-5-2018.2018-07-15.CRIS.10001,NOTPROVIDED,processed`;

const ynabResult: YnabRow[] = [
  {
    Date: '07/19/2018',
    Payee: 'John Doe',
    Memo: 'Invoice 2018006',
    Outflow: '180.00',
    Inflow: undefined,
  },
  {
    Date: '07/19/2018',
    Payee: 'Company',
    Memo: 'LB-5-2018.2018-07-15.CRIS.10001',
    Outflow: undefined,
    Inflow: '558.00',
  },
];

describe('Kontist Parser Module', () => {
  describe('Matcher', () => {
    it('should match Kontist files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await kontist.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await kontist.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await kontist.parse(file);
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
