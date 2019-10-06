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

import { TimeProviders, useRelativeTime } from '../../src/index.js';
import DayContext from '../../src/TimeProviders/DayContext';
import HourContext from '../../src/TimeProviders/HourContext';
import MinuteContext from '../../src/TimeProviders/MinuteContext';
import MonthContext from '../../src/TimeProviders/MonthContext';
import SecondContext from '../../src/TimeProviders/SecondContext';
import YearContext from '../../src/TimeProviders/YearContext';
import {
  ONE_DAY,
  ONE_HOUR,
  ONE_MINUTE,
  ONE_MONTH,
  ONE_SECOND,
  ONE_YEAR,
} from '../../src/constants';
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

const RelativeTime = React.memo(({ globalMaximumTolerance, targetTime }) => {
  const renderCount = useRenderCount();
  const { scale, time, timeDifference } = useRelativeTime(targetTime);

  const timeDate = new Date(time - timeDifference);
  const nowAsDate = new Date(time);

  return (
    <>
      <span>{formatDistanceStrict(timeDate, nowAsDate, dateFnsOptions)} ago</span>
      <span>Render count: {renderCount}</span>
      <span>Accuracy: {scale}ms</span>
    </>
  );
});

const timeUnits = [
  { label: 'Seconds', unit: ONE_SECOND, value: 'seconds' },
  { label: 'Minutes', unit: ONE_MINUTE, value: 'minutes' },
  { label: 'Hours', unit: ONE_HOUR, value: 'hours' },
  { label: 'Days', unit: ONE_DAY, value: 'days' },
  { label: 'Months', unit: ONE_MONTH, value: 'months' },
  { label: 'Years', unit: ONE_YEAR, value: 'years' },
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
      const { unit } = offsetTimeUnit;
      const offsetInMs = offsetValue * unit;
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
                      <Item key={timeUnit.value} value={timeUnit.value}>
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

export const uncontrolledExamples = () => {
  const generateId = useIdGenerator();
  const [comments, setComments] = useState([
    { id: generateId(), targetTime: Date.now() - ONE_HOUR, text: 'Very nice, very nice.' },
    { id: generateId(), targetTime: Date.now() - ONE_MINUTE, text: 'Wow, so performant!' },
    { id: generateId(), targetTime: Date.now() - 50 * ONE_SECOND, text: 'This is so cool!' },
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

  return (
    <ThemeProvider>
      <TimeProviders
        onIntervalUpdate={handleIntervalUpdate}
        onRegistrationsUpdate={handleRegistrationsUpdate}
      >
        <Layout>
          <Information>
            <h1>Relative Time</h1>
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
      </TimeProviders>
    </ThemeProvider>
  );
};

const storyDetails = {
  title: 'Relative Time',
  decorators: [withKnobs],
};

export default storyDetails;
