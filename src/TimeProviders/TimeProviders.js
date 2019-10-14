import generateTimeProviders from './generateTimeProviders';
import { ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY, ONE_MONTH, ONE_YEAR } from '../durations';

const TimeProviders = generateTimeProviders(
  [ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY, ONE_MONTH, ONE_YEAR],
  ONE_MINUTE
);

export default TimeProviders;
