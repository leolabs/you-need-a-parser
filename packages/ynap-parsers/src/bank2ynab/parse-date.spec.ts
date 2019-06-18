import { parseDate, ynabDate } from './parse-date';
import { format } from 'date-fns';

describe('bank2ynab Date Parser', () => {
  it('should parse dates correctly', () => {
    const result1 = parseDate('20.12.2018', '%d.%m.%Y');
    expect(format(result1, 'MM/dd/yyyy')).toBe('12/20/2018');

    const result2 = parseDate('20/12/2018', '%d/%m/%Y');
    expect(format(result2, 'MM/dd/yyyy')).toBe('12/20/2018');

    const result3 = parseDate('10 Feb 18', '%d %b %y');
    expect(format(result3, 'MM/dd/yyyy')).toBe('02/10/2018');

    const result4 = parseDate('10 Feb 18', '%d %b %y');
    expect(format(result4, 'MM/dd/yyyy')).toBe('02/10/2018');

    const result5 = parseDate('2019-03-04');
    expect(format(result5, 'MM/dd/yyyy')).toBe('03/04/2019');
  });
});

describe('bank2ynab YNAB Date Formatter', () => {
  it('should format dates correctly according to the YNAB format', () => {
    const result1 = ynabDate(new Date('2018-03-18'));
    expect(result1).toBe('03/18/2018');
  });
});
