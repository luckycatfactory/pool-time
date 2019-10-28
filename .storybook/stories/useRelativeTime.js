import React, { useCallback, useMemo, useRef, useState } from 'react';
import { formatDistanceStrict } from 'date-fns';
import { withKnobs, boolean, number } from '@storybook/addon-knobs/react';
import { storiesOf } from '@storybook/react';
import { Avatar as GardenAvatar, Text } from '@zendeskgarden/react-avatars';
import { Button } from '@zendeskgarden/react-buttons';
import {
  Dropdown,
  Field as DropdownField,
  Item,
  Menu,
  Select,
} from '@zendeskgarden/react-dropdowns';
import { Field, Input, Label, Hint, Textarea, Toggle } from '@zendeskgarden/react-forms';
import { ThemeProvider } from '@zendeskgarden/react-theming';
import styled from 'styled-components';
import '@storybook/addon-knobs/register';
import '@zendeskgarden/react-avatars/dist/styles.css';
import '@zendeskgarden/react-buttons/dist/styles.css';
import '@zendeskgarden/react-dropdowns/dist/styles.css';
import '@zendeskgarden/react-forms/dist/styles.css';

import { generateTimeProviders, useRelativeTime } from '../../src/index.js';
import { ONE_DAY, FIVE_SECONDS, ONE_HOUR, ONE_MINUTE, ONE_SECOND } from '../../src/durations';
import useRenderCount from '../useRenderCount';
import useIdGenerator from '../useIdGenerator';

const Layout = styled.div`
  max-width: 600px;
`;

const Information = styled.div`
  background-color: #f8f9f9;
  padding: 24px;
`;

const Comments = styled.div`
  padding: 16px 0;
`;

const Comment = styled.div`
  border-bottom: 1px solid grey;
  display: flex;
  min-height: 64px;
  padding: 8px;
`;

const Author = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: center;
  width: 32px;
`;

const Avatar = styled(GardenAvatar)`
  background-color: grey;
`;

const Body = styled.div`
  display: flex;
  flex: 8;
  flex-direction: column;
  padding: 0 16px;
`;

const Message = styled.div``;

const TimeInformation = styled.p`
  > span {
    margin: 0 12px;
  }
`;

const Options = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const AddCommentLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddCommentOffset = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 100%;
`;

const AddCommentHasOffset = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AddCommentOffsetFields = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AddCommentSubmitBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  width: 100%;
`;

const dateFnsOptions = { roundingMethod: 'floor' };

const RelativeTime = React.memo(({ targetTime }) => {
  const renderCount = useRenderCount();
  const { duration, time, timeDifference } = useRelativeTime(targetTime);

  const timeDate = new Date(time - timeDifference);
  const nowAsDate = new Date(time);
  console.log(time, timeDifference);

  return (
    <>
      <span>{formatDistanceStrict(timeDate, nowAsDate, dateFnsOptions)} ago</span>
      <span>Render count: {renderCount}</span>
      <span>Accuracy: {duration}ms</span>
    </>
  );
});

const timeUnits = [
  { label: 'Seconds', unit: ONE_SECOND, value: 'seconds' },
  { label: 'Seconds', unit: FIVE_SECONDS, value: 'seconds' },
  { label: 'Minutes', unit: ONE_MINUTE, value: 'minutes' },
  { label: 'Hours', unit: ONE_HOUR, value: 'hours' },
  { label: 'Days', unit: ONE_DAY, value: 'days' },
];
const downshiftProps = { itemToString: item => item && item.label };
const AddComment = React.memo(({ onSubmit }) => {
  const [hasOffset, setHasOffset] = useState(false);
  const [offsetValue, setOffsetValue] = useState(0);
  const [offsetTimeUnit, setOffsetTimeUnit] = useState(timeUnits[0]);
  const [text, setText] = useState('');

  const handleToggleChange = useCallback(e => {
    setHasOffset(e.target.checked);
  }, []);

  const handleOffsetValueChange = useCallback(e => {
    setOffsetValue(parseInt(e.target.value));
  }, []);
  const handleOffsetTimeUnitChange = useCallback(selectedItem => {
    const timeUnit = timeUnits.find(unit => unit.value === selectedItem);
    setOffsetTimeUnit(timeUnit);
  }, []);

  const handleSubmit = useCallback(() => {
    if (hasOffset && offsetValue) {
      const {
        unit: { value: unitValue },
      } = offsetTimeUnit;
      const offsetInMs = offsetValue * unitValue;
      onSubmit(text, offsetInMs);
    } else {
      onSubmit(text);
    }
    setText('');
  }, [hasOffset, offsetValue, offsetTimeUnit, onSubmit, text]);
  const handleChange = useCallback(e => {
    setText(e.target.value);
  }, []);

  return (
    <AddCommentLayout>
      <Field>
        <Textarea value={text} onChange={handleChange} />
      </Field>
      <AddCommentOffset>
        <AddCommentHasOffset>
          <Field>
            <Toggle checked={hasOffset} onChange={handleToggleChange}>
              <Label>Use Offset</Label>
              <Hint>This offsets your comment to the past</Hint>
            </Toggle>
          </Field>
        </AddCommentHasOffset>
        {hasOffset && (
          <AddCommentOffsetFields>
            <span>
              <Field>
                <Label>Offset Value</Label>
                <Input onChange={handleOffsetValueChange} small type="number" value={offsetValue} />
              </Field>
            </span>
            <span>
              <Field>
                <Dropdown
                  downshiftProps={downshiftProps}
                  onSelect={handleOffsetTimeUnitChange}
                  selectedItem={offsetTimeUnit}
                >
                  <DropdownField>
                    <Label>Offset Time Unit</Label>
                    <Select small>{offsetTimeUnit.label}</Select>
                  </DropdownField>
                  <Menu>
                    {timeUnits.map(timeUnit => (
                      <Item key={timeUnit.value} value={timeUnit}>
                        {timeUnit.label}
                      </Item>
                    ))}
                  </Menu>
                </Dropdown>
              </Field>
            </span>
          </AddCommentOffsetFields>
        )}
      </AddCommentOffset>
      <AddCommentSubmitBar>
        <span>
          <Button onClick={handleSubmit} primary>
            Add Comment
          </Button>
        </span>
      </AddCommentSubmitBar>
    </AddCommentLayout>
  );
});

const durationToLabel = {
  [ONE_SECOND.key]: 'One Second',
  [FIVE_SECONDS.key]: 'Five Seconds',
  [ONE_MINUTE.key]: 'One Minute',
  [ONE_HOUR.key]: 'One Hour',
  [ONE_DAY.key]: 'One Day',
};

const TimeProviders = generateTimeProviders(
  [ONE_SECOND, FIVE_SECONDS, ONE_MINUTE],
  [
    {
      difference: ONE_SECOND,
      maximumAccuracy: ONE_SECOND,
      minimumAccuracy: ONE_SECOND,
      preferredAccuracy: ONE_SECOND,
    },
    {
      difference: ONE_MINUTE,
      maximumAccuracy: FIVE_SECONDS,
      minimumAccuracy: FIVE_SECONDS,
      preferredAccuracy: FIVE_SECONDS,
    },
  ]
);

export const commentsExample = () => {
  const generateId = useIdGenerator();
  const [globalMinimumAccuracy, setGlobalMinimumAccuracy] = useState(ONE_MINUTE);
  const [comments, setComments] = useState([
    { id: generateId(), targetTime: Date.now() - ONE_HOUR.value, text: 'Very nice, very nice.' },
    { id: generateId(), targetTime: Date.now() - ONE_MINUTE.value, text: 'Wow, so performant!' },
    { id: generateId(), targetTime: Date.now() - 58 * ONE_SECOND.value, text: 'This is so cool!' },
  ]);
  const [currentIntervalDuration, setCurrentIntervalDuration] = useState(null);

  const handleGlobalMinimumAccuracySelect = useCallback(selectedItem => {
    setGlobalMinimumAccuracy(selectedItem);
  }, []);

  const handleIntervalUpdate = useCallback(interval => {
    console.log('interval?', interval);
    setCurrentIntervalDuration(interval);
  }, []);
  const [currentRegistrations, setCurrentRegistrations] = useState({});
  const handleRegistrationsUpdate = useCallback(
    registrations => setCurrentRegistrations(registrations),
    []
  );

  const handleAddCommentSubmit = useCallback((text, offset) => {
    setComments(comments => {
      const targetTime = offset ? Date.now() - offset : Date.now();
      const newComment = { id: generateId(), targetTime, text };
      return [...comments, newComment];
    });
  }, []);
  const handleRemovalClick = useCallback(e => {
    const id = e.currentTarget.getAttribute('data-comment-id');
    setComments(comments => comments.filter(comment => comment.id !== parseInt(id)));
  }, []);

  const downshiftProps = { itemToString: item => item.value };

  return (
    <TimeProviders
      onIntervalUpdate={handleIntervalUpdate}
      onRegistrationsUpdate={handleRegistrationsUpdate}
    >
      <ThemeProvider>
        <Layout>
          <Information>
            <h1>Relative Time</h1>
            <Field>
              <Dropdown
                downshiftProps={downshiftProps}
                onSelect={handleGlobalMinimumAccuracySelect}
                selectedItem={globalMinimumAccuracy}
              >
                <DropdownField>
                  <Label>Global Minimum Accuracy</Label>
                  <Select>{durationToLabel[globalMinimumAccuracy.key]}</Select>
                </DropdownField>
                <Menu>
                  {[ONE_SECOND, FIVE_SECONDS, ONE_MINUTE, ONE_HOUR, ONE_DAY].map(duration => (
                    <Item key={duration.key} value={duration}>
                      {durationToLabel[duration.key]}
                    </Item>
                  ))}
                </Menu>
              </Dropdown>
            </Field>
            {currentIntervalDuration && (
              <p>The global interval is currently set to {currentIntervalDuration} milliseconds.</p>
            )}
            {!currentIntervalDuration && (
              <p>
                Since there aren't any consumers of the time contexts on the page, there's currently
                no interval!
              </p>
            )}
          </Information>
          <Comments>
            {comments.map(({ id, targetTime, text }) => (
              <Comment key={id}>
                <Author>
                  <Avatar size="small">
                    <Text>R</Text>
                  </Avatar>
                </Author>
                <Body>
                  <Message>{text}</Message>
                  <TimeInformation>
                    <RelativeTime targetTime={targetTime} />
                  </TimeInformation>
                </Body>
                <Options>
                  <Button data-comment-id={id} link onClick={handleRemovalClick} small>
                    remove
                  </Button>
                </Options>
              </Comment>
            ))}
          </Comments>
          <AddComment onSubmit={handleAddCommentSubmit} />
        </Layout>
      </ThemeProvider>
    </TimeProviders>
  );
};

const storyDetails = {
  title: 'useRelativeTime',
  decorators: [withKnobs],
};

export default storyDetails;
