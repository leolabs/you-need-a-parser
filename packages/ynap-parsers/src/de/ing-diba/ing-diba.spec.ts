import { generateYnabDate, ingDiBa } from './ing-diba';
import { YnabRow, YnabFile } from '../..';
import { encode } from 'iconv-lite';

const content = encode(
  `Umsatzanzeige;Datei erstellt am: 03.04.2019 22:16
;Letztes Update: aktuell

IBAN;DE11 XXXX XXXX XXXX XXXX 72
Kontoname;Girokonto
Bank;ING
Kunde;John Doe
Zeitraum;03.04.2018 - 03.04.2019

Sortierung;Datum absteigend

In der CSV-Datei finden Sie alle bereits gebuchten Umsätze. Die vorgemerkten Umsätze werden nicht aufgenommen, auch wenn sie in Ihrem Internetbanking angezeigt werden.

Buchung;Valuta;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Betrag;Währung
03.04.2019;03.04.2019;eprimo GmbH;Lastschrift;eprimo sagt danke;-71,00;EUR
03.04.2019;03.04.2019;Income;Gehalt/Rente;MAERZ 2019;700,00;EUR`,
  'win1252',
);

const ynabResult: YnabFile[] = [
  {
    data: [
      {
        Date: '04/03/2019',
        Payee: 'eprimo GmbH',
        Memo: 'eprimo sagt danke',
        Outflow: '71.00',
        Inflow: undefined,
      },
      {
        Date: '04/03/2019',
        Payee: 'Income',
        Memo: 'MAERZ 2019',
        Outflow: undefined,
        Inflow: '700.00',
      },
    ],
  },
];

describe('ING-DiBa Parser Module', () => {
  describe('Matcher', () => {
    it('should match ING-DiBa files by file name', async () => {
      const validFile = new File(
        [],
        'Umsatzanzeige_DE27100777770209299700_20190403.csv',
      );
      const result = await ingDiBa.match(validFile);
      expect(result).toBe(true);
    });

    it('should not match other files by file name', async () => {
      const invalidFile = new File([], 'test.csv');
      const result = await ingDiBa.match(invalidFile);
      expect(result).toBe(false);
    });

    it('should match ING-DiBa files by fields', async () => {
      const file = new File([content], 'test.csv');
      const result = await ingDiBa.match(file);
      expect(result).toBe(true);
    });

    it('should not match empty files', async () => {
      const file = new File([], 'test.csv');
      const result = await ingDiBa.match(file);
      expect(result).toBe(false);
    });
  });

  describe('Parser', () => {
    it('should parse data correctly', async () => {
      const file = new File([content], 'test.csv');
      const result = await ingDiBa.parse(file);
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
