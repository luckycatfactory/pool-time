import React from 'react';
import { formatDistanceStrict } from 'date-fns';
import { withKnobs, boolean, text } from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react';
import '@storybook/addon-knobs/register';

import { TimeProviders, useRelativeTime } from '../../src/index.js';
import DayContext from '../../src/TimeProviders/DayContext';
import HourContext from '../../src/TimeProviders/HourContext';
import MinuteContext from '../../src/TimeProviders/MinuteContext';
import MonthContext from '../../src/TimeProviders/MonthContext';
import SecondContext from '../../src/TimeProviders/SecondContext';
import YearContext from '../../src/TimeProviders/YearContext';

const targetTime = Date.now();
const dateFnsOptions = { roundingMethod: 'floor' };

const RelativeTime = React.memo(() => {
  const difference = useRelativeTime(targetTime);

  const timeDate = new Date(targetTime);
  const now = new Date(Date.now());

  return formatDistanceStrict(timeDate, now, dateFnsOptions);
});

export const uncontrolledExamples = () => (
  <TimeProviders>
    <RelativeTime />
  </TimeProviders>
);

const ControlledRelativeTime = React.memo(({ now }) => (
  <YearContext.Provider value={now}>
    <MonthContext.Provider value={now}>
      <DayContext.Provider value={now}>
        <HourContext.Provider value={now}>
          <MinuteContext.Provider value={now}>
            <SecondContext.Provider value={now}>
              <RelativeTime />
            </SecondContext.Provider>
          </MinuteContext.Provider>
        </HourContext.Provider>
      </DayContext.Provider>
    </MonthContext.Provider>
  </YearContext.Provider>
));

export const controlledExamples = () => {
  const now = text('now', Date.now());

  return <ControlledRelativeTime now={now} />;
};

const storyDetails = {
  title: 'Relative Time',
  decorators: [withKnobs],
};

export default storyDetails;
