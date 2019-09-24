import React from 'react';
import { TimeProvider, useTimeToTheMinute, useTimeToTheSecond } from '../../src/index.js';
import useRenderCount from '../useRenderCount';

const displayLayoutStyles = { display: 'flex', 'flex-direction': 'column', height: '100%' };

const DisplayLayout = React.memo(({ children }) => <div style={displayLayoutStyles}>{children}</div>);

const timeDisplayStyles = { flexGrow: '1', 'text-align': 'center' };

const TimeDisplay = React.memo(({ children }) => <div style={timeDisplayStyles}>{children}</div>);

const renderCountDisplayStyles = { 'background-color': 'grey', color: 'white', height: '24px', 'text-align': 'center' };

const RenderCountDisplay = React.memo(({ children }) => <div style={renderCountDisplayStyles}># of Renders: {children}</div>)

const secondTimeFormatter = time => new Date(time).getSeconds();

const SecondRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheSecond(secondTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const minuteTimeFormatter = time => new Date(time).getMinutes();

const MinuteRenderer = React.memo(() => {
  const renderCount = useRenderCount();
  const time = useTimeToTheMinute(minuteTimeFormatter);

  return <DisplayLayout><TimeDisplay>{time}</TimeDisplay><RenderCountDisplay>{renderCount}</RenderCountDisplay></DisplayLayout>;
});

const timeLayoutStyles = { display: 'flex', 'flex-direction': 'row', width: '100%' };

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
