import React from 'react';
import {
  TimeProviders,
  useTimeToTheDay,
  useTimeToTheHour,
  useTimeToTheMinute,
  useTimeToTheMonth,
  useTimeToTheSecond,
  useTimeToTheYear,
} from '../../src';
import useRenderCount from '../useRenderCount';

const displayLayoutStyles = { display: 'flex', flexDirection: 'column', height: '100%' };

const DisplayLayout = React.memo(({ children }) => (
  <div style={displayLayoutStyles}>{children}</div>
));

const timeDescriptionStyles = { backgroundColor: 'red', textAlign: 'center' };

const TimeDescription = React.memo(({ children }) => (
  <div style={timeDescriptionStyles}>{children}</div>
));

const timeDisplayStyles = {
  alignItems: 'center',
  display: 'flex',
  flexGrow: '1',
  fontSize: '24px',
  justifyContent: 'center',
  textAlign: 'center',
};

const TimeDisplay = React.memo(({ children }) => <div style={timeDisplayStyles}>{children}</div>);

const renderCountDisplayStyles = {
  backgroundColor: 'grey',
  color: 'white',
  height: '24px',
  textAlign: 'center',
};

const RenderCountDisplay = React.memo(({ children }) => (
  <div style={renderCountDisplayStyles}># of Renders: {children}</div>
));

const dayTimeFormatter = time => new Date(time).getDate();

const DayRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheDay(dayTimeFormatter);

  return (
    <DisplayLayout>
      <TimeDescription>Days</TimeDescription>
      <TimeDisplay>{time}</TimeDisplay>
      <RenderCountDisplay>{renderCount}</RenderCountDisplay>
    </DisplayLayout>
  );
});

const hourTimeFormatter = time => new Date(time).getHours();

const HourRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheHour(hourTimeFormatter);

  return (
    <DisplayLayout>
      <TimeDescription>Hours</TimeDescription>
      <TimeDisplay>{time}</TimeDisplay>
      <RenderCountDisplay>{renderCount}</RenderCountDisplay>
    </DisplayLayout>
  );
});

const minuteTimeFormatter = time => new Date(time).getMinutes();

const MinuteRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheMinute(minuteTimeFormatter);

  return (
    <DisplayLayout>
      <TimeDescription>Minutes</TimeDescription>
      <TimeDisplay>{time}</TimeDisplay>
      <RenderCountDisplay>{renderCount}</RenderCountDisplay>
    </DisplayLayout>
  );
});

const monthTimeFormatter = time => new Date(time).getMonth() + 1;

const MonthRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheMonth(monthTimeFormatter);

  return (
    <DisplayLayout>
      <TimeDescription>Months</TimeDescription>
      <TimeDisplay>{time}</TimeDisplay>
      <RenderCountDisplay>{renderCount}</RenderCountDisplay>
    </DisplayLayout>
  );
});

const secondTimeFormatter = time => new Date(time).getSeconds();

const SecondRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheSecond(secondTimeFormatter);

  return (
    <DisplayLayout>
      <TimeDescription>Seconds</TimeDescription>
      <TimeDisplay>{time}</TimeDisplay>
      <RenderCountDisplay>{renderCount}</RenderCountDisplay>
    </DisplayLayout>
  );
});

const yearTimeFormatter = time => new Date(time).getFullYear();

const YearRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheYear(yearTimeFormatter);

  return (
    <DisplayLayout>
      <TimeDescription>Years</TimeDescription>
      <TimeDisplay>{time}</TimeDisplay>
      <RenderCountDisplay>{renderCount}</RenderCountDisplay>
    </DisplayLayout>
  );
});

const timeLayoutStyles = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '100%' };

const TimeLayout = React.memo(({ children }) => <div style={timeLayoutStyles}>{children}</div>);

const timeSize = '128px';
const timeItemStyles = {
  border: '1px solid grey',
  borderRadius: '2px',
  height: timeSize,
  margin: '12px',
  width: timeSize,
};

const TimeItem = React.memo(({ children }) => <div style={timeItemStyles}>{children}</div>);

const Primitives = React.memo(() => (
  <TimeLayout>
    <TimeItem>
      <YearRenderer />
    </TimeItem>
    <TimeItem>
      <MonthRenderer />
    </TimeItem>
    <TimeItem>
      <DayRenderer />
    </TimeItem>
    <TimeItem>
      <HourRenderer />
    </TimeItem>
    <TimeItem>
      <MinuteRenderer />
    </TimeItem>
    <TimeItem>
      <SecondRenderer />
    </TimeItem>
  </TimeLayout>
));

export const clockExample = () => (
  <TimeProviders>
    <Primitives />
  </TimeProviders>
);

const storyDetails = {
  title: 'primitives',
};

export default storyDetails;
