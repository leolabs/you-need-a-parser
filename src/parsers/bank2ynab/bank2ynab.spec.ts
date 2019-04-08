import {
  calculateInflow,
  calculateOutflow,
  trimHeaderAndFooterRows,
} from './bank2ynab';

describe('bank2ynab Parser Module', () => {
  describe('Inflow Parser', () => {
    it('should parse inflow correctly', () => {
      expect(calculateInflow(undefined, undefined)).toBeUndefined();
      expect(calculateInflow(10, undefined)).toBe(10);
      expect(calculateInflow(0, undefined)).toBe(0);
      expect(calculateInflow(-10, undefined)).toBeUndefined();
      expect(() => calculateInflow(10, 20)).toThrow();
      expect(calculateInflow(undefined, -20)).toBe(20);
    });
  });

  describe('Outflow Parser', () => {
    it('should parse outflow correctly', () => {
      expect(calculateOutflow(undefined, undefined)).toBeUndefined();
      expect(calculateOutflow(undefined, 10)).toBe(10);
      expect(calculateOutflow(undefined, 0)).toBe(0);
      expect(calculateOutflow(undefined, -10)).toBeUndefined();
      expect(() => calculateOutflow(10, 20)).toThrow();
      expect(calculateOutflow(-20, undefined)).toBe(20);
    });
  });

  describe('Row Trimming', () => {
    it('should correctly trim lines on the start and end of a string', () => {
      const input = '1\n2\n3\n4\n5';

      expect(trimHeaderAndFooterRows(input)).toBe(input);
      expect(trimHeaderAndFooterRows(input, 1, 0)).toBe('2\n3\n4\n5');
      expect(trimHeaderAndFooterRows(input, 1, 1)).toBe('2\n3\n4');
    });
  });
});
