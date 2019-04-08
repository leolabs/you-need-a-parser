import { parseDate } from './parse-date';
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
  });
});
