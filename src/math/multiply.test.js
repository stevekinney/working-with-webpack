const multiply = require('./multiply');

describe('multiply', () => {
  it('should correctly multiply a number by 2', () => {
    expect(multiply(2, 2)).toBe(4);
    expect(multiply(4, 2)).toBe(8);
    expect(multiply(16, 2)).toBe(32);
  });

  it('should correctly multiply a number by 4', () => {
    expect(multiply(2, 4)).toBe(8);
    expect(multiply(4, 4)).toBe(16);
    expect(multiply(16, 4)).toBe(64);
  });

  it('should correctly multiply a number by 5', () => {
    expect(multiply(2, 5)).toBe(10);
    expect(multiply(4, 5)).toBe(20);
    expect(multiply(16, 5)).toBe(80);
  });

  it('should correctly multiply a number by 10', () => {
    expect(multiply(2, 10)).toBe(20);
    expect(multiply(4, 10)).toBe(40);
    expect(multiply(16, 10)).toBe(160);
  });
});