import { mt940matcher, mt940parser, generateYnabDate } from './mt940';
import fs from 'fs';
import path from 'path';
import { YnabFile } from '../..';

const content = fs.readFileSync(path.join(__dirname, 'test-data/mt940-bunq.sta'));

const output: YnabFile[] = [
  {
    accountName: 'BUNQ BV NL28BUNQ0000000002 EUR',
    data: [
      {
        Outflow: undefined,
        Inflow: 250,
        Date: '08/26/2019',
        Memo: '/IBAN/DE84100110010000000002/NAME/Name/REMI/Playing money',
      },
      {
        Outflow: 0.99,
        Inflow: undefined,
        Date: '08/26/2019',
        Memo:
          '/NAME/Aral Station 140974148/REMI/Aral Station 140974148 Brueggen, DE',
      },
      {
        Outflow: 0.01,
        Inflow: undefined,
        Date: '08/26/2019',
        Memo: '/IBAN/NL89BUNQ0000000056/NAME/L.P. Name/REMI/',
      },
    ],
  },
];

describe('MT940 Parser Module', () => {
  describe('Matcher', () => {
    it('should correctly match MT940 files', async () => {
      const result = await mt940matcher(new File([content], ''));
      expect(result).toBeTruthy();
    });

    it('should fail to match invalid files', async () => {
      const result = await mt940matcher(new File(['test'], ''));
      expect(result).toBeFalsy();
    });
  });

  describe('Parser', () => {
    it('should correctly parse MT940 files', async () => {
      const result = await mt940parser(new File([content], 'test.sta'));
      expect(result).toEqual(output);
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
