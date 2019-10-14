import { generateTimeContextDefaultObject } from '../../utilities';
import * as DURATIONS from '../../durations';

describe('generateTimeContextDefaultObject()', () => {
  it.each(Object.keys(DURATIONS).map(key => [key, DURATIONS[key]]))(
    'returns the correct object given the input duration %s',
    (key, duration) => {
      const object = generateTimeContextDefaultObject(duration);
      expect(generateTimeContextDefaultObject(duration)).toEqual({
        duration,
        registerConsumer: expect.any(Function),
        time: expect.any(Number),
        unregisterConsumer: expect.any(Function),
      });
      expect(() => {
        object.registerConsumer();
      }).not.toThrow();
      expect(() => {
        object.unregisterConsumer();
      }).not.toThrow();
    }
  );
});
