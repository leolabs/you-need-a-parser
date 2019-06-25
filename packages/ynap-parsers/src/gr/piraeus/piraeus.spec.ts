import { generateYnabDate, piraeus } from './piraeus';
import { YnabFile } from '../..';
import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(
  path.join(__dirname, 'test-data/Account.Transactions_20190601.xlsx'),
);

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Category: 'Income / Income',
        Date: '05/31/2019',
        Memo: 'ΕΡΝΣΤ & ΓΙΑΝΓΚ ( ΕΛΛΑΣ ) ΟΡΚΩΤ',
        Inflow: 878.91,
      },
      {
        Category: 'Home / Telecoms',
        Date: '05/31/2019',
        Memo: 'VODAFONE CU TOP UP ATHINA',
        Outflow: 10,
      },
      {
        Category: 'Home / Supermarket',
        Date: '05/29/2019',
        Memo: 'LIDL THESSALONIKI',
        Outflow: 7.74,
      },
      {
        Category: 'Obligations / Services',
        Date: '05/28/2019',
        Memo: 'DELIVERY GR IKE PATRON',
        Outflow: 8.4,
      },
      {
        Category: 'Obligations / Services',
        Date: '05/24/2019',
        Memo: 'DELIVERY GR IKE PATRON',
        Outflow: 9.4,
      },
      {
        Category: 'Cash / Withdrawals',
        Date: '05/23/2019',
        Memo: 'S1D22032 ΑΓ.ΔΗΜΗΤΡΙΟΥ ΘΕΣΣΑΛΟΝ.',
        Outflow: 80,
      },
      {
        Category: 'Home / Supermarket',
        Date: '05/23/2019',
        Memo: 'LIDL THESSALONIKI',
        Outflow: 8.85,
      },
      {
        Category: 'Obligations / Services',
        Date: '05/23/2019',
        Memo: 'DELIVERY GR IKE PATRON',
        Outflow: 9.3,
      },
      {
        Category: 'Cash / Withdrawals',
        Date: '05/22/2019',
        Memo: 'S1D22032 ΑΓ.ΔΗΜΗΤΡΙΟΥ ΘΕΣΣΑΛΟΝ.',
        Outflow: 60,
      },
      {
        Category: 'Leisure / Restaurants',
        Date: '05/22/2019',
        Memo: 'CHAROUPI OE DOXIS 4',
        Outflow: 53.5,
      },
      {
        Category: 'Home / Supermarket',
        Date: '05/22/2019',
        Memo: 'MASOUTIS_KRISTALLI_1 THESSALONIKI',
        Outflow: 10.49,
      },
      {
        Category: 'Leisure / Entertainment',
        Date: '05/21/2019',
        Memo: 'PAYPAL  NETFLIX COM 35314369001',
        Outflow: 11.99,
      },
      {
        Category: 'Leisure / Entertainment',
        Date: '05/21/2019',
        Memo: 'Spotify P0AE6C5F27 Stockholm',
        Outflow: 6.99,
      },
      {
        Category: 'Obligations / Services',
        Date: '05/20/2019',
        Memo: 'DELIVERY GR IKE PATRON',
        Outflow: 11.5,
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
