import { generateYnabDate, bancomer, trimMetaData } from './bbva-bancomer';
import { YnabFile } from '../..';
import { encode, decode } from 'iconv-lite';

const content = encode(
  `Card number: ·9999
TRANSACTION BREAKDOWN
DATE	DESCRIPTION	OUTFLOW	INFLOW	BALANCE
     Titular *9999
13/04/2019	RESTAURANT	"1,064.80"		"11,509.22"
12/4/2019	GROCERIES	471.66		"10,444.42"
     Digital *8888
9/4/2019	AMAZON	"1,022.00"		"9,651.92"

"BBVA Bancomer, S.A., Institución de Banca Múltiple, Grupo Financiero BBVA Bancomer."
  `,
  'utf16le',
);

const trimmedContent = `13/04/2019	RESTAURANT	"1,064.80"		"11,509.22"
12/4/2019	GROCERIES	471.66		"10,444.42"
9/4/2019	AMAZON	"1,022.00"		"9,651.92"`;

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '04/13/2019',
        Inflow: undefined,
        Memo: 'RESTAURANT',
        Outflow: 1064.8,
      },
      {
        Date: '04/12/2019',
        Inflow: undefined,
        Memo: 'GROCERIES',
        Outflow: 471.66,
      },
      {
        Date: '04/09/2019',
        Inflow: undefined,
        Memo: 'AMAZON',
        Outflow: 1022,
      },
    ],
  },
];

describe('BBVA Bancomer Parser Module', () => {
  describe('Matcher', () => {
    it('should match bancomer files by file name', async () => {
      const fileName = 'descarga.csv';
      const result = !!fileName.match(bancomer.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await bancomer.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match bancomer files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await bancomer.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await bancomer.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await bancomer.parse(file);
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

  describe('Metadata Trimmer', () => {
    it('should trim all metadata from a valid input string', () => {
      expect(trimMetaData(decode(content, 'utf16le'))).toEqual(trimmedContent);
    });
  });
});
