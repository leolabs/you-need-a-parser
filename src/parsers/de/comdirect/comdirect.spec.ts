import {
  generateYnabDate,
  comdirect,
  extractField,
  trimMetaData,
} from './comdirect';
import { YnabRow } from '../..';
import { encode, decode } from 'iconv-lite';

const content = encode(
  `;
"Umsätze Verrechnungskonto ";"Zeitraum: 30 Tage";
"Neuer Kontostand";"16,94 EUR";

"Buchungstag";"Wertstellung (Valuta)";"Vorgang";"Buchungstext";"Umsatz in EUR";
"01.04.2019";"03.04.2019";"Wertpapiere";" Buchungstext: ISHSII-MSCI EUR.SRI EOACC WPKNR: A1H7ZS ISIN: IE00B52VJ196 Ref. 25F1909221559359/2 ";"-119,98";
"01.04.2019";"01.04.2019";"DTA-glt. Buchung";" Zahlungspflichtiger: John DoeKto/IBAN: DE84100110012626835902 BLZ/BIC: NTSBDEB1XXX Buchungstext: Sparplan 1 Ref. H9219087I4644658/2 ";"180,00";

"Alter Kontostand";"16,89 EUR";`,
  'win1252',
);

const trimmedContent = `"Buchungstag";"Wertstellung (Valuta)";"Vorgang";"Buchungstext";"Umsatz in EUR";
"01.04.2019";"03.04.2019";"Wertpapiere";" Buchungstext: ISHSII-MSCI EUR.SRI EOACC WPKNR: A1H7ZS ISIN: IE00B52VJ196 Ref. 25F1909221559359/2 ";"-119,98";
"01.04.2019";"01.04.2019";"DTA-glt. Buchung";" Zahlungspflichtiger: John DoeKto/IBAN: DE84100110012626835902 BLZ/BIC: NTSBDEB1XXX Buchungstext: Sparplan 1 Ref. H9219087I4644658/2 ";"180,00";`;

const ynabResult: YnabRow[] = [
  {
    Date: '04/01/2019',
    Memo: 'ISHSII-MSCI EUR.SRI EOACC WPKNR: A1H7ZS ISIN: IE00B52VJ196',
    Outflow: '119.98',
  },
  {
    Date: '04/01/2019',
    Payee: 'John Doe',
    Memo: 'Sparplan 1',
    Inflow: '180.00',
  },
];

describe('comdirect Parser Module', () => {
  describe('Matcher', () => {
    it('should match comdirect files by file name', async () => {
      const validFile = new File([], 'umsaetze_1182395441_20190403-2324.csv');
      const result = await comdirect.match(validFile);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await comdirect.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match comdirect files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await comdirect.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await comdirect.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await comdirect.parse(file);
      expect(result).toEqual(ynabResult);
    });
  });

  describe('Date Converter', () => {
    it('should format an input date correctly', () => {
      expect(generateYnabDate('03.05.2018')).toEqual('05/03/2018');
    });

    it('should throw an error when the input date is incorrect', () => {
      expect(() => generateYnabDate('1.1.1')).toThrow('not a valid date');
    });
  });

  describe('Field Extractor', () => {
    const postingText1 =
      ' Buchungstext: AMUNDI ETF MSCI WLD X EMU WPKNR: A0RPV6 ISIN: FR0010756114 Ref. 07F1909220100960/2 ';

    const postingText2 =
      ' Zahlungspflichtiger: John DoeKto/IBAN: DE27100777770209299700 BLZ/BIC: NTSBDEB1XXX Buchungstext: Sparplan 1 Ref. H9219087I4642658/2 ';

    it('should extract a given field from a posting text', () => {
      expect(extractField(postingText1, 'Buchungstext')).toEqual(
        'AMUNDI ETF MSCI WLD X EMU WPKNR: A0RPV6 ISIN: FR0010756114',
      );
      expect(extractField(postingText1, 'Ref')).toEqual('07F1909220100960/2');
      expect(extractField(postingText2, 'Zahlungspflichtiger')).toEqual('John Doe');
      expect(extractField(postingText2, 'Buchungstext')).toEqual('Sparplan 1');
      expect(extractField(postingText2, 'Kto/IBAN')).toEqual(
        'DE27100777770209299700',
      );
    });

    it("should return undefined when a field doesn't exist", () => {
      expect(extractField(postingText1, 'Zahlungspflichtiger')).toBeUndefined();
      expect(extractField(postingText1, 'Auftraggeber')).toBeUndefined();
    });
  });

  describe('Metadata Trimmer', () => {
    it('should trim all metadata from a valid input string', () => {
      expect(trimMetaData(decode(content, 'win1252'))).toEqual(trimmedContent);
    });

    it('should throw an error when the input string is invalid', () => {
      expect(() => trimMetaData('invalid string')).toThrow(
        'file format is incorrect',
      );
    });
  });
});
