import { calculateInflow, calculateOutflow, parseNumber } from './bank2ynab';

describe('bank2ynab Parser Module', () => {
  describe('Number Parser', () => {
    it('should parse numbers in different formats correctly', () => {
      expect(parseNumber('10,00')).toBe(10);
      expect(parseNumber('12.50 ')).toBe(12.5);
    });

    it('should return NaN when a number is invalid', () => {
      expect(parseNumber('test')).toBeNaN();
    });
  });

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
});
