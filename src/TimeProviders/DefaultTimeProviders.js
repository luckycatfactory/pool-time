import generateTimeProviders from './generateTimeProviders';
import { ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY } from '../durations';

export const DEFAULT_DURATIONS = [ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY];

const TimeProviders = generateTimeProviders(DEFAULT_DURATIONS, ONE_MINUTE);

export default TimeProviders;
