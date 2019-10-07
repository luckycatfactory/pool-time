import { generateTimeContextDefaultObject } from '../utilities';
import * as DURATIONS from '../constants';

describe('utilities', () => {
  describe('generateTimeContextDefaultObject()', () => {
    it.each(Object.keys(DURATIONS).map(key => [key, DURATIONS[key]]))(
      'returns the correct object given the input duration %s',
      (key, duration) => {
        expect(generateTimeContextDefaultObject(duration)).toEqual({
          registerConsumer: expect.any(Function),
          scale: duration,
          time: expect.any(Number),
          unregisterConsumer: expect.any(Function),
        });
      }
    );
  });
});
