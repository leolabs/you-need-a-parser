import { generateYnabDate, outbank, OutbankRow } from './outbank';
import { YnabRow } from '.';

const content: OutbankRow[] = [
  {
    '#': '1',
    Account: 'DE27100777770209299700',
    Date: '4/2/19',
    'Value Date': '',
    Amount: '-44,98',
    Currency: 'EUR',
    Name: 'Shell',
    Number: '',
    Bank: '',
    Reason: 'SHELL 0672',
    Category: 'Travel',
    Subcategory: 'Gas Station',
    Tags: '',
    Note: '',
    'Bank name': '',
    'Ultimate Receiver Name': '',
    'Original Amount': '-44,98',
    'Compensation Amount': '',
    'Exchange Rate': '1',
    'Posting Key': '',
    'Posting Text': '',
    'Purpose Code': '',
    'SEPA Reference': '',
    'Client Reference': '',
    'Mandate Identification': '',
    'Originator Identifier': '',
  },
  {
    '#': '2',
    Account: 'DE27100777770209299700',
    Date: '4/2/19',
    'Value Date': '',
    Amount: '44,98',
    Currency: 'EUR',
    Name: 'Shell',
    Number: '',
    Bank: '',
    Reason: 'SHELL 0672',
    Category: 'Travel',
    Subcategory: 'Gas Station',
    Tags: '',
    Note: '',
    'Bank name': '',
    'Ultimate Receiver Name': '',
    'Original Amount': '-44,98',
    'Compensation Amount': '',
    'Exchange Rate': '1',
    'Posting Key': '',
    'Posting Text': '',
    'Purpose Code': '',
    'SEPA Reference': '',
    'Client Reference': '',
    'Mandate Identification': '',
    'Originator Identifier': '',
  },
];

const ynabResult: YnabRow[] = [
  {
    Date: '04/02/2019',
    Payee: 'Shell',
    Category: 'Travel',
    Memo: 'SHELL 0672',
    Outflow: '44.98',
    Inflow: undefined,
  },
  {
    Date: '04/02/2019',
    Payee: 'Shell',
    Category: 'Travel',
    Memo: 'SHELL 0672',
    Outflow: undefined,
    Inflow: '44.98',
  },
];

describe('Outbank Parser Module', () => {
  describe('Matcher', () => {
    it('should match Outbank files by file name', async () => {
      const validFile = new File([], 'Outbank_Export_20190403.csv');
      const result = await outbank.matcher(validFile, [{}]);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await outbank.matcher(invalidFile, [{}]);
      expect(result).toBe(false);
    });

    it('should match Outbank files by fields', async () => {
      const file = new File([], 'test.csv');
      const result = await outbank.matcher(file, content);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await outbank.matcher(file, []);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const result = await outbank.parser(content);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
