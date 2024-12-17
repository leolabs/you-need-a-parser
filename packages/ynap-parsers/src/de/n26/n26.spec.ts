import { generateYnabDate, n26 } from './n26';
import { YnabFile } from '../..';
import { unparse } from 'papaparse';

const content2021 = unparse([
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

const ynabResult2021: YnabFile[] = [
  {
    data: [
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
    ],
  },
];

const content2024 = unparse([
  {
    'Booking Date': '2024-08-01',
    'Value Date': '2024-08-01',
    'Partner Name': 'theName',
    'Partner Iban': 'DE49100000000000000000',
    Type: 'Debit Transfer',
    'Payment Reference': 'Rent payment',
    'Account Name': 'Main Account',
    'Amount (EUR)': '-519.20',
    'Original Amount': '',
    'Original Currency': '',
    'Exchange Rate': '',
  },
  {
    'Booking Date': '2024-08-04',
    'Value Date': '2024-08-03',
    'Partner Name': 'A company',
    'Partner Iban': '',
    Type: 'Presentment',
    'Payment Reference': '',
    'Account Name': 'Main Account',
    'Amount (EUR)': '-324.83',
    'Original Amount': '350',
    'Original Currency': 'USD',
    'Exchange Rate': '0.9280857143',
  },
]);

const ynabResult2024: YnabFile[] = [
  {
    data: [
      {
        Date: '08/01/2024',
        Payee: 'theName',
        Category: undefined,
        Memo: 'Rent payment',
        Outflow: '519.20',
        Inflow: undefined,
      },
      {
        Date: '08/04/2024',
        Payee: 'A company',
        Category: undefined,
        Memo: '',
        Outflow: '324.83',
        Inflow: undefined,
      },
    ],
  },
];

describe('N26 Parser Module', () => {
  describe('Matcher', () => {
    it('should match N26 files by file name (old format)', async () => {
      const fileName = 'n26-csv-transactions.csv';
      const result = !!fileName.match(n26.filenamePattern);
      expect(result).toBe(true);
    });

    it('should match N26 files by file name (2024 format)', async () => {
      const fileName = 'MainAccount_2024-08-01_2024-09-07.csv';
      const result = !!fileName.match(n26.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const fileName = 'invalid.csv';
      const result = !!fileName.match(n26.filenamePattern);
      expect(result).toBe(false);
    });

    it('should match N26 files until 2021 by fields', async () => {
      const file = new File([content2021], 'test.csv');
      const result = await n26.match(file);
      expect(result).toBe(true);
    });

    it('should match N26 files for 2024 format by fields', async () => {
      const file = new File([content2024], 'test.csv');
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
    it('should parse data until 2021 correctly', async () => {
      const file = new File([content2021], 'test.csv');
      const result = await n26.parse(file);
      expect(result).toEqual(ynabResult2021);
    });

    it('should parse data for 2024 format correctly', async () => {
      const file = new File([content2024], 'test.csv');
      const result = await n26.parse(file);
      expect(result).toEqual(ynabResult2024);
    });
  });

  describe('Date Converter', () => {
    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow(
        'The input is not a valid date. Expected formats: YYYY-MM-DD or DD.MM.YYYY'
      );
    });

    it('should convert dates in old format correctly', () => {
      expect(generateYnabDate('01.01.2019')).toEqual('01/01/2019');
    });

    it('should convert dates in 2024 format correctly', () => {
      expect(generateYnabDate('2024-08-01')).toEqual('08/01/2024');
    });
  });
});