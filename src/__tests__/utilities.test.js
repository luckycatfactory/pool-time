import { getDateNow } from '../utilities';

describe('utilities', () => {
  describe('getDateNow()', () => {
    const mockNow = 0;
    const originalDateNow = Date.now;

    beforeEach(() => {
      Date.now = jest.fn(() => mockNow);
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it('returns the return value of Date.now()', () => {
      expect(getDateNow()).toBe(mockNow);
    });
  });
});
