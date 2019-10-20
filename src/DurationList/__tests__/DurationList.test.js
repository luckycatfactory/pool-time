import DurationList from '../';
import { ONE_SECOND, ONE_MINUTE } from '../../durations';

describe('DurationList', () => {
  describe('validations', () => {
    it('properly fails if the input is not an array', () => {
      expect(() => {
        new DurationList({});
      }).toThrow('Expected durations to be an array, but it was not.');
    });

    it('properly fails if any of the durations are not proper durations', () => {
      expect(() => {
        new DurationList([{ not: 'A DURATION' }]);
      }).toThrow('Expected duration object to have a key, but it did not.');
    });

    it('properly fails if any of the durations are not in ascending order', () => {
      expect(() => {
        new DurationList([ONE_MINUTE, ONE_SECOND]);
      }).toThrow('Expected input durations to be ascending order, but they were not.');
    });

    it('properly fails if any of the durations are not unique', () => {
      expect(() => {
        new DurationList([ONE_SECOND, ONE_SECOND]);
      }).toThrow('Expected all input durations to be unique, but they were not.');
    });
  });

  it('does not fail when provided valid input', () => {
    expect(() => {
      new DurationList([ONE_SECOND, ONE_MINUTE]);
    }).not.toThrow();
  });

  it('returns the correct response when get() is called', () => {
    const input = [ONE_SECOND, ONE_MINUTE];
    const durationList = new DurationList(input);
    expect(durationList.get()).toEqual(input);
    expect(durationList.get()).toBe(input);
  });
});
