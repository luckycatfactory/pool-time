import React from 'react';
import { formatDistanceStrict } from 'date-fns';
import { TimeProviders, useRelativeTime } from '../../src/index.js';

const targetTime = Date.now();
const dateFnsOptions = { roundingMethod: 'floor' };

const RelativeTime = React.memo(() => {
  const difference = useRelativeTime(targetTime);

  const timeDate = new Date(targetTime);
  const now = new Date(Date.now());

  return formatDistanceStrict(timeDate, now, dateFnsOptions);
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
