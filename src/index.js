export { default as TimeProvider } from './TimeProvider/index.js';
export { default as useTimeToTheDay } from './useTimeToTheDay';
export { default as useTimeToTheHour } from './useTimeToTheHour';
export { default as useTimeToTheMinute } from './useTimeToTheMinute';
export { default as useTimeToTheMonth } from './useTimeToTheMonth';
export { default as useTimeToTheSecond } from './useTimeToTheSecond';
export { default as useTimeToTheYear } from './useTimeToTheYear';

export const useRelativeTime = (baseTime) => {
  const now = Date.now();

  return now;
}
