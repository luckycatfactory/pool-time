import generateTimeObject from './utilities/generateTimeObject';

// META
export { ETERNITY } from '@luckycatfactory/pool-time-core';

// SECONDS
export const ONE_SECOND = generateTimeObject('ONE_SECOND', 1000);
export const TWO_SECONDS = generateTimeObject('TWO_SECONDS', 2000);
export const THREE_SECONDS = generateTimeObject('THREE_SECONDS', 3000);
export const FOUR_SECONDS = generateTimeObject('FOUR_SECONDS', 4000);
export const FIVE_SECONDS = generateTimeObject('FIVE_SECONDS', 5000);
export const TEN_SECONDS = generateTimeObject('TEN_SECONDS', 10000);
export const FIFTEEN_SECONDS = generateTimeObject('FIFTEEN_SECONDS', 15000);
export const TWENTY_SECONDS = generateTimeObject('TWENTY_SECONDS', 20000);
export const THIRTY_SECONDS = generateTimeObject('THIRTY_SECONDS', 30000);

// MINUTES
export const ONE_MINUTE = generateTimeObject('ONE_MINUTE', 60000);
export const TWO_MINUTES = generateTimeObject('TWO_MINUTES', 120000);
export const THREE_MINUTES = generateTimeObject('THREE_MINUTES', 180000);
export const FOUR_MINUTES = generateTimeObject('FOUR_MINUTES', 240000);
export const FIVE_MINUTES = generateTimeObject('FIVE_MINUTES', 300000);
export const TEN_MINUTES = generateTimeObject('TEN_MINUTES', 600000);
export const FIFTEEN_MINUTES = generateTimeObject('FIFTEEN_MINUTES', 900000);
export const TWENTY_MINUTES = generateTimeObject('TWENTY_MINUTES', 1200000);
export const THIRTY_MINUTES = generateTimeObject('THIRTY_MINUTES', 1800000);
export const FORTY_FIVE_MINUTES = generateTimeObject(
  'FORTY_FIVE_MINUTES',
  2700000
);

// HOURS
export const ONE_HOUR = generateTimeObject('ONE_HOUR', 3600000);
export const TWO_HOURS = generateTimeObject('TWO_HOURS', 7200000);
export const THREE_HOURS = generateTimeObject('THREE_HOURS', 10800000);
export const FOUR_HOURS = generateTimeObject('FOUR_HOURS', 14400000);
export const FIVE_HOURS = generateTimeObject('FIVE_HOURS', 18000000);
export const SIX_HOURS = generateTimeObject('SIX_HOURS', 21600000);
