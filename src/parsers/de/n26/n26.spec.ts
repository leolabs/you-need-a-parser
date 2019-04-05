import { generateYnabDate, n26 } from './n26';
import { YnabRow } from '../..';
import { unparse } from 'papaparse';

const content = unparse([
  {
    Date: '2019-01-01',
    Payee: 'Test Payee',
    'Account number': 'DE27100777770209299700',
    'Transaction type': 'Outgoing Transfer',
    'Payment reference': 'Netflix',
    Category: 'Subscriptions & Donations',
    'Amount (EUR)': '-3.0',
    'Amount (Foreign Currency)': '',
    'Type Foreign Currency': '',
    'Exchange Rate': '',
  },
  {
    Date: '2019-01-02',
    Payee: 'Work Account',
    'Account number': '',
    'Transaction type': 'MasterCard Payment',
    'Payment reference': '',
    Category: 'Income',
    'Amount (EUR)': '600.0',
    'Amount (Foreign Currency)': '600.0',
    'Type Foreign Currency': 'EUR',
    'Exchange Rate': '1.0',
  },
]);

const ynabResult: YnabRow[] = [
  {
    Date: '01/01/2019',
    Payee: 'Test Payee',
    Category: 'Subscriptions & Donations',
    Memo: 'Netflix',
    Outflow: '3.00',
    Inflow: undefined,
  },
  {
    Date: '01/02/2019',
    Payee: 'Work Account',
    Category: 'Income',
    Memo: '',
    Outflow: undefined,
    Inflow: '600.00',
  },
];

describe('N26 Parser Module', () => {
  describe('Matcher', () => {
    it('should match N26 files by file name', async () => {
      const validFile = new File([], 'n26-csv-transactions.csv');
      const result = await n26.match(validFile);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'invalid.csv');
      const result = await n26.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match N26 files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await n26.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await n26.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await n26.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });

    it('should convert dates correctly', () => {
      expect(generateYnabDate('2018-09-01')).toEqual('09/01/2018');
    });
  });
});
