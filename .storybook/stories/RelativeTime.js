import React from 'react';
import { distanceInWordsStrict } from 'date-fns';
import { TimeProviders, useRelativeTime } from '../../src/index.js';

const targetTime = Date.now() - 55 * 1000;

const RelativeTime = React.memo(() => {
  const time = useRelativeTime(targetTime);

  const timeAsDate = new Date(time);
  const targetTimeAsDate = new Date(targetTime);

  return distanceInWordsStrict(timeAsDate, targetTimeAsDate);
});

export const hooks = () => (
  <TimeProviders>
    <RelativeTime />
  </TimeProviders>
);

const storyDetails = {
  title: 'Relative Time',
};

export default storyDetails;
