import React, { useCallback, useMemo, useRef, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { withKnobs, boolean, number } from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react';
import '@storybook/addon-knobs/register';

import { TimeProviders, useRelativeTime } from '../../src/index.js';
import DayContext from '../../src/TimeProviders/DayContext';
import HourContext from '../../src/TimeProviders/HourContext';
import MinuteContext from '../../src/TimeProviders/MinuteContext';
import MonthContext from '../../src/TimeProviders/MonthContext';
import SecondContext from '../../src/TimeProviders/SecondContext';
import YearContext from '../../src/TimeProviders/YearContext';
import { ONE_HOUR, ONE_MINUTE } from '../../src/constants';
import useRenderCount from '../useRenderCount';

const dateFnsOptions = { roundingMethod: 'floor' };

const RelativeTime = React.memo(({ globalMaximumTolerance, targetTime }) => {
  const renderCount = useRenderCount();
  const [isStrict, setIsStrict] = useState(false);
  const { scale, time, timeDifference } = useRelativeTime(targetTime, {
    globalMaximumTolerance: HourContext,
  });

  const handleStrictOnClick = useCallback(() => {
    setIsStrict(!isStrict);
  }, [isStrict]);

  const timeDate = new Date(time - timeDifference);
  const nowAsDate = new Date(time);

  return (
    <div>
      <div>{formatDistanceStrict(timeDate, nowAsDate, dateFnsOptions)} ago</div>
      <div>Degree of Accuracy: {scale}ms.</div>
      <div>Render count: {renderCount}</div>
      <div>
        <button onClick={handleStrictOnClick}>{isStrict ? 'Unmake Strict' : 'Make Strict'}</button>
      </div>
    </div>
  );
});

export const uncontrolledExamples = () => {
  const targetTimeForSecond = useMemo(() => Date.now(), []);
  const targetTimeForMinute = useMemo(() => Date.now() - ONE_MINUTE, []);
  const targetTimeForHour = useMemo(() => Date.now() - ONE_HOUR, []);
  const [comments, setComments] = useState([
    { targetTime: targetTimeForSecond, text: 'This is so cool!' },
    { targetTime: targetTimeForMinute, text: 'Wow, so performant!' },
    { targetTime: targetTimeForHour, text: 'Very nice, very nice.' },
  ]);

  return (
    <TimeProviders>
      <div>
        {comments.map(({ targetTime, text }) => (
          <div>
            <span>{text}</span>
            <RelativeTime targetTime={targetTime} />
          </div>
        ))}
      </div>
    </TimeProviders>
  );
};

const storyDetails = {
  title: 'Relative Time',
  decorators: [withKnobs],
};

export default storyDetails;
