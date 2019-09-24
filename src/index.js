export { default as TimeProvider } from './TimeProvider/index.js';
export { default as useTimeToTheMinute } from './useTimeToTheMinute';
export { default as useTimeToTheSecond } from './useTimeToTheSecond';

export const useRelativeTime = (baseTime) => {
  const now = Date.now();

  return now;
}
