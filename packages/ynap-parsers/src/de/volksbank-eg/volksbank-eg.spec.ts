import { generateYnabDate, volksbankEG } from './volksbank-eg';
import { YnabFile } from '../..';
import { encode } from 'iconv-lite';

const content = encode(
  `Volksbank eG;;;;;;;;;;;;
;;;;;;;;;;;;
Umsatzanzeige;;;;;;;;;;;;
;;;;;;;;;;;;
BLZ:;42461435;;Datum:;04.04.2019;;;;;;;;
Konto:;1008800049;;Uhrzeit:;22:57:16;;;;;;;;
Abfrage von:;Hermann Testkunde;;Kontoinhaber:;Hermann Testkunde;;;;;;;;
;;;;;;;;;;;;
Zeitraum:;;von:;28.03.2019;bis:;;;;;;;;
Betrag in EUR:;;von:; ;bis:; ;;;;;;;
Sortiert nach:;Buchungstag;absteigend;;;;;;;;;;
;;;;;;;;;;;;
Buchungstag;Valuta;Auftraggeber/Zahlungsempfänger;Empfänger/Zahlungspflichtiger;Konto-Nr.;IBAN;BLZ;BIC;Vorgang/Verwendungszweck;Kundenreferenz;Währung;Umsatz;
03.04.2019;04.04.2019;Hermann Testkunde;Gartenbauverein;12345678;;70190000;;"ÜBERWEISUNG
Quartalsbeitrag Gartenbauverein
Musterstadt 73 e.V.
vom 03.03.2005
Verwendete TAN: 123456";;EUR;12;S
03.04.2019;04.04.2019;Hermann Testkunde;Hermann Testkunde;;;;;"ÜBERTRAG
Hermann Testkunde
UEBERTRAG VOM ANLAGEKONTO";;EUR;112;H
03.04.2019;04.04.2019;Hermann Testkunde;;;;;;"ÜBERWEISUNG
Kaufstadt Lebensmittel
Vielen Dank fuer Ihren Einkauf";;EUR;258,17;S
;;;;;;;;;;;;
28.03.2019;;;;;;;;;Anfangssaldo;EUR;22.257,11;H
04.04.2019;;;;;;;;;Endsaldo;EUR;21.488,94;H
  `,
  'win1252',
);

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '04/04/2019',
        Inflow: '12.00',
        Memo: 'Quartalsbeitrag Gartenbauverein Musterstadt 73 e.V. vom 03.03.2005',
        Outflow: undefined,
        Payee: 'Gartenbauverein',
      },
      {
        Date: '04/04/2019',
        Inflow: '112.00',
        Memo: 'Hermann Testkunde UEBERTRAG VOM ANLAGEKONTO',
        Outflow: undefined,
        Payee: 'Hermann Testkunde',
      },
      {
        Date: '04/04/2019',
        Inflow: '258.17',
        Memo: 'Kaufstadt Lebensmittel Vielen Dank fuer Ihren Einkauf',
        Outflow: undefined,
        Payee: '',
      },
    ],
  },
];

describe('Volksbank Parser Module', () => {
  describe('Matcher', () => {
    it('should match Volksbank files by file name', async () => {
      const fileName = 'Umsaetze_DE84000099000008800049_2019.04.04.csv';
      const result = !!fileName.match(volksbankEG.filenamePattern);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await volksbankEG.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match Volksbank files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await volksbankEG.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await volksbankEG.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await volksbankEG.parse(file);
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
});
