import generateTimeProviders from './generateTimeProviders';
import { ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY } from '../durations';

export const DEFAULT_DURATIONS = [ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY];

const DefaultTimeProviders = generateTimeProviders(DEFAULT_DURATIONS, [
  {
    difference: ONE_SECOND,
    maximumAccuracy: ONE_SECOND,
    minimumAccuracy: ONE_SECOND,
    preferredAccuracy: ONE_SECOND,
  },
]);

export default DefaultTimeProviders;
