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
import { ONE_HOUR, ONE_MINUTE, ONE_SECOND } from '../../src/constants';
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

let id = 0;

const generateId = () => id++;

export const uncontrolledExamples = () => {
  const [comments, setComments] = useState([
    { id: generateId(), targetTime: Date.now() - 50 * ONE_SECOND, text: 'This is so cool!' },
    { id: generateId(), targetTime: Date.now() - ONE_MINUTE, text: 'Wow, so performant!' },
    { id: generateId(), targetTime: Date.now() - ONE_HOUR, text: 'Very nice, very nice.' },
  ]);
  const [currentIntervalDuration, setCurrentIntervalDuration] = useState(null);
  const handleIntervalUpdate = useCallback(interval => {
    setCurrentIntervalDuration(interval);
  }, []);
  const [currentRegistrations, setCurrentRegistrations] = useState({});
  const handleRegistrationsUpdate = useCallback(
    registrations => setCurrentRegistrations(registrations),
    []
  );

  const addNewComment = useCallback(() => {
    setComments(comments => {
      const newComment = { id: generateId(), targetTime: Date.now(), text: 'new comment' };
      return [...comments, newComment];
    });
  }, []);
  const handleRemovalClick = useCallback(e => {
    const id = e.currentTarget.getAttribute('data-comment-id');
    setComments(comments => comments.filter(comment => comment.id !== parseInt(id)));
  }, []);

  return (
    <TimeProviders
      onIntervalUpdate={handleIntervalUpdate}
      onRegistrationsChange={handleRegistrationsUpdate}
    >
      <div>
        <div>Current Global Interval: {currentIntervalDuration}</div>
        <div>{JSON.stringify(currentRegistrations)}</div>
        {comments.map(({ id, targetTime, text }) => (
          <div key={id}>
            <span>{text}</span>
            <RelativeTime targetTime={targetTime} />
            <button onClick={handleRemovalClick} data-comment-id={id}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div>
        <button onClick={addNewComment}>Add New Comment</button>
      </div>
    </TimeProviders>
  );
};

const storyDetails = {
  title: 'Relative Time',
  decorators: [withKnobs],
};

export default storyDetails;
