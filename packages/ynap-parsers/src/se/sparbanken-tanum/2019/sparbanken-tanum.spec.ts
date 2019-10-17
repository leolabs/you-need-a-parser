import fs from 'fs';
import path from 'path';
import { generateYnabDate, sparbankenTanum } from './sparbanken-tanum';
import { YnabFile } from '../../..';

const data: YnabFile[] = [
  {
    accountName: 'Privatkonto-0036110559',
    data: [
      {
        Date: '10/12/2019',
        Payee: 'ANTIKVARIAT NORD',
        Category: 'Swish',
        Outflow: '120.00',
      },
      {
        Date: '10/12/2019',
        Payee: 'Klaraspar',
        Category: 'Överföring',
        Outflow: '11.00',
      },
      {
        Date: '10/11/2019',
        Payee: 'NOVARA MEDIA DON',
        Category: 'Kortköp/uttag',
        Outflow: '61.95',
      },
      {
        Date: '10/10/2019',
        Payee: 'HEMGLASS GOTEBOR',
        Category: 'Kortköp/uttag',
        Outflow: '119.00',
      },
      {
        Date: '10/10/2019',
        Payee: 'THE RED LION',
        Category: 'Kortköp/uttag',
        Outflow: '600.00',
      },
      {
        Date: '10/10/2019',
        Payee: 'SNABB SKO OCH NY',
        Category: 'Kortköp/uttag',
        Outflow: '160.00',
      },
      {
        Date: '10/10/2019',
        Payee: 'PARKERINGSBOLAGE',
        Category: 'Kortköp/uttag',
        Outflow: '319.00',
      },
      {
        Date: '10/10/2019',
        Payee: 'PARKERINGSBOLAGE',
        Category: 'Kortköp/uttag',
        Inflow: '290.00',
      },
      {
        Date: '10/09/2019',
        Payee: 'TIER SE 10-54856',
        Category: 'Kortköp/uttag',
        Outflow: '20.00',
      },
      {
        Date: '10/09/2019',
        Payee: 'GRO',
        Category: 'Kortköp/uttag',
        Outflow: '600.00',
      },
      {
        Date: '10/09/2019',
        Payee: '+46739803283',
        Category: 'Swish skickad',
        Outflow: '79.00',
      },
      {
        Date: '10/09/2019',
        Payee: '+46735127836',
        Category: 'Swish skickad',
        Outflow: '600.00',
      },
      {
        Date: '10/09/2019',
        Payee: '+46730357319',
        Category: 'Swish skickad',
        Outflow: '300.00',
      },
      {
        Date: '10/08/2019',
        Payee: 'NEW DELI',
        Category: 'Kortköp/uttag',
        Outflow: '79.00',
      },
      {
        Date: '10/07/2019',
        Payee: 'ZENIT CAF',
        Category: 'Kortköp/uttag',
        Outflow: '25.00',
      },
      {
        Date: '10/07/2019',
        Payee: 'LINDEX/153',
        Category: 'Kortköp/uttag',
        Outflow: '198.00',
      },
      {
        Date: '10/07/2019',
        Payee: 'PANDURO HOBBY',
        Category: 'Kortköp/uttag',
        Outflow: '322.20',
      },
      {
        Date: '10/07/2019',
        Payee: 'SJ AB',
        Category: 'Swish',
        Outflow: '295.00',
      },
      {
        Date: '10/07/2019',
        Payee: 'SJ AB',
        Category: 'Swish',
        Outflow: '2050.00',
      },
      {
        Date: '10/06/2019',
        Payee: 'MARKUS SWERLANDE',
        Category: 'Swish',
        Outflow: '20.00',
      },
      {
        Date: '10/05/2019',
        Payee: 'Tre Indier',
        Category: 'Kortköp/uttag',
        Outflow: '400.00',
      },
      {
        Date: '10/05/2019',
        Payee: 'KOCKJOHAN HANDEL',
        Category: 'Kortköp/uttag',
        Outflow: '99.00',
      },
      {
        Date: '10/05/2019',
        Payee: 'TIER SE 10-23247',
        Category: 'Kortköp/uttag',
        Outflow: '16.00',
      },
      {
        Date: '10/05/2019',
        Payee: 'HEMMA HOS',
        Category: 'Kortköp/uttag',
        Outflow: '230.00',
      },
      {
        Date: '10/05/2019',
        Payee: '+46733691750',
        Category: 'Swish skickad',
        Outflow: '300.00',
      },
      {
        Date: '10/05/2019',
        Payee: 'Klaraspar',
        Category: 'Överföring',
        Outflow: '11.00',
      },
      {
        Date: '10/02/2019',
        Payee: 'HSO*Fußkomplizen',
        Category: 'Kortköp/uttag',
        Outflow: '1275.71',
      },
      {
        Date: '10/01/2019',
        Payee: 'MAX GAMLA ULLEVI',
        Category: 'Kortköp/uttag',
        Outflow: '118.00',
      },
    ],
  },
];

const content = fs.readFileSync(
  path.join(__dirname, 'test-data', 'Transaktioner_2019-10-12_14-57-29.csv'),
);

describe('Sparbanken Tanum Parser Module (2019)', () => {
  describe('Matcher', () => {
    it('should match Sparbanken Tanum files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await sparbankenTanum.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await sparbankenTanum.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await sparbankenTanum.parse(file);
      expect(result).toEqual(data);
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
