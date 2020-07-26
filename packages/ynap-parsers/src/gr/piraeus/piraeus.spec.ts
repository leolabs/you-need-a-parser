import { generateYnabDate, piraeus } from './piraeus';
import { YnabFile } from '../..';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(
  path.join(__dirname, 'test-data/Account.Transactions_20200725.xlsx'),
);

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Category: 'Restaurants',
        Date: '07/25/2020',
        Memo: 'KAPETANAKIS IOANNIS THESSALONIKI(DEBIT PURCHASE AUTHORIZATION)',
        Inflow: undefined,
        Outflow: 13,
      },
      {
        Category: 'Supermarket',
        Date: '07/24/2020',
        Memo: 'GOYSIOS ARTOZAXAROPLAS ETHN ANTISTA(DEBIT PURCHASE AUTHORIZATION)',
        Inflow: undefined,
        Outflow: 2,
      },
      {
        Category: 'Restaurants',
        Date: '07/24/2020',
        Memo: 'E FOOD GR IRAKLEIO (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 18,
      },
      {
        Category: 'Supermarket',
        Date: '07/23/2020',
        Memo: 'AB VASILOPOULOS S.A. KALAMARIA (DEBIT PURCHASE AUTHORIZATION)',
        Inflow: undefined,
        Outflow: 33.49,
      },
      {
        Category: 'Pharmacy',
        Date: '07/23/2020',
        Memo: 'ALISE ALIKI GKERMANI KALAMARIA THE (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 6.35,
      },
      {
        Category: 'Supermarket',
        Date: '07/22/2020',
        Memo: 'GOYSIOS ARTOZAXAROPLAS ETHN ANTISTA(DEBIT PURCHASE AUTHORIZATION)',
        Inflow: undefined,
        Outflow: 2,
      },
      {
        Category: 'Day to day',
        Date: '07/22/2020',
        Memo: 'WWW.OSMOSHOP.GR THESSALONIKI (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 52.2,
      },
      {
        Category: 'Income',
        Date: '07/21/2020',
        Memo: 'Νετφλιξ Ιουλίου (TRF.FROM THIRD PARTY ACC.)',
        Inflow: 7,
        Outflow: undefined,
      },
      {
        Category: 'Equipment',
        Date: '07/21/2020',
        Memo: 'LEROY MERLIN SGB SA PIL PYLAIA (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 10.58,
      },
      {
        Category: 'Equipment',
        Date: '07/21/2020',
        Memo: 'LEROY MERLIN SGB SA PIL PYLAIA (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 10.07,
      },
      {
        Category: 'Entertainment',
        Date: '07/21/2020',
        Memo: 'PAYPAL NETFLIX COM 35314369001 (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 13.99,
      },
      {
        Category: 'Car service',
        Date: '07/21/2020',
        Memo: 'J K P AVAX IKTEO PILEA (CARD PURCHASE)',
        Inflow: undefined,
        Outflow: 5,
      },
      {
        Category: 'Reallocated',
        Date: '07/21/2020',
        Memo: '5273060686186 (TRANSFER TO ACCOUNT)',
        Inflow: undefined,
        Outflow: 129.99,
      },
      {
        Category: 'Transfers',
        Date: '07/21/2020',
        Memo: '5237024209987 (TRANS.TO THIRD PARTY ACC.)',
        Inflow: undefined,
        Outflow: 24,
      },
      {
        Category: 'Bank fees',
        Date: '07/20/2020',
        Memo: 'ΠΡΟΜΗΘΕΙΑ ΕΜΒΑΣΜΑΤΟΣ (TRANSFER COMMISSION)',
        Inflow: undefined,
        Outflow: 4,
      },
      {
        Category: 'Income',
        Date: '07/20/2020',
        Memo: 'B/O WORLDPAY AP LTD (INCOMING TRANSFER)',
        Inflow: 130.73,
        Outflow: undefined,
      },
      {
        Category: 'Bank fees',
        Date: '07/20/2020',
        Memo: 'ΖΕΝΙΘ ΡΕΥΜΑ (BILL PAYMENT COMMISSION)',
        Inflow: undefined,
        Outflow: 0.6,
      },
      {
        Category: 'Energy',
        Date: '07/20/2020',
        Memo: 'ΖΕΝΙΘ ΡΕΥΜΑ (BILL PAYMENT)',
        Inflow: undefined,
        Outflow: 25.67,
      },
    ],
  },
];

describe('Piraeus Bank Parser Module', () => {
  describe('Matcher', () => {
    it('should match Piraeus Bank files by file name', async () => {
      const fileName = 'Account Transactions_20190601.xlsx';
      const result = !!fileName.match(piraeus.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.xlsx');
      const result = await piraeus.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match Piraeus Bank files by fields', async () => {
      const file = new File([content], 'test.xlsx');
      const result = await piraeus.match(file);
      expect(result).toBe(true);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.xlsx');
      const result = await piraeus.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should format an input date correctly', () => {
      expect(generateYnabDate('03/05/2018')).toEqual('05/03/2018');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });
});
