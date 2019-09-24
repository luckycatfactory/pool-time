export { default as TimeProvider } from './TimeProvider/index.js';

export const useRelativeTime = (baseTime) => {
  const now = Date.now();

  return now;
}
