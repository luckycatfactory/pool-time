import React from 'react';
import { TimeProvider, useTimeToTheDay, useTimeToTheHour, useTimeToTheMinute, useTimeToTheMonth, useTimeToTheSecond, useTimeToTheYear } from '../../src/index.js';
import useRenderCount from '../useRenderCount';

const displayLayoutStyles = { display: 'flex', 'flexDirection': 'column', height: '100%' };

const DisplayLayout = React.memo(({ children }) => <div style={displayLayoutStyles}>{children}</div>);

const timeDisplayStyles = { flexGrow: '1', 'textAlign': 'center' };

const TimeDisplay = React.memo(({ children }) => <div style={timeDisplayStyles}>{children}</div>);

const renderCountDisplayStyles = { 'backgroundColor': 'grey', color: 'white', height: '24px', 'textAlign': 'center' };

const RenderCountDisplay = React.memo(({ children }) => <div style={renderCountDisplayStyles}># of Renders: {children}</div>)

const dayTimeFormatter = time => new Date(time).getDate();

const DayRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheDay(dayTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const hourTimeFormatter = time => new Date(time).getHours();

const HourRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheHour(hourTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const minuteTimeFormatter = time => new Date(time).getMinutes();

const MinuteRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheMinute(minuteTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const monthTimeFormatter = time => new Date(time).getMonth() + 1;

const MonthRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheMonth(monthTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const secondTimeFormatter = time => new Date(time).getSeconds();

const SecondRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheSecond(secondTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const yearTimeFormatter = time => new Date(time).getFullYear();

const YearRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheYear(yearTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const timeLayoutStyles = { display: 'flex', 'flexDirection': 'row', width: '100%' };

const TimeLayout = React.memo(({ children }) => <div style={timeLayoutStyles}>{children}</div>);

const timeSize = '128px';
const timeItemStyles = { border: '1px solid grey', height: timeSize, margin: '12px', width: timeSize };

const TimeItem = React.memo(({ children }) => (
  <div style={timeItemStyles}>{children}</div>
));

const TimeProviderRenderer = React.memo(() => (
  <TimeProvider>
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
  </TimeProvider>
));

export const timeProvider = () => <TimeProviderRenderer />;

const storyDetails = {
  title: 'TimeProvider'
};

export default storyDetails;
