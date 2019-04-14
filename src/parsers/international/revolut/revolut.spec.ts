import { generateYnabDate, revolut } from './revolut';
import { YnabFile } from '../..';

const content = `Completed Date ; Description ; Paid Out (RON) ; Paid In (RON) ; Exchange Out; Exchange In; Balance (RON); Category; Notes
Apr 2, 2019 ; Premium plan fee  ; 29.99 ;  ;  ;  ; 13.09; general;
Apr 1, 2019 ; To Piglet  ;  ; 1.42 ;  ;  ; 43.08; transfers;
`;

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '04/02/2019',
        Payee: 'Premium plan fee',
        Category: 'general',
        Memo: 'Premium plan fee',
        Outflow: '29.99',
        Inflow: undefined,
      },
      {
        Date: '04/01/2019',
        Payee: 'To Piglet',
        Category: 'transfers',
        Memo: 'To Piglet',
        Outflow: undefined,
        Inflow: '1.42',
      },
    ],
  },
];

describe('Revolut Parser Module', () => {
  describe('Matcher', () => {
    it('should match Revolut files by file name', async () => {
      const validFile = new File(
        [],
        'Revolut-RON-Statement-May 2018 – Apr 2019.csv',
      );
      const result = await revolut.match(validFile);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'invalid.csv');
      const result = await revolut.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match Revolut files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await revolut.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await revolut.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await revolut.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('Invalid time value');
    });

    it('should convert dates correctly', () => {
      expect(generateYnabDate('Feb 12, 2019')).toEqual('02/12/2019');
    });
  });
});
