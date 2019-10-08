import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import useRelativeTime from '../useRelativeTime';
import TimeProviders from '../TimeProviders';
import { getDateNow } from '../utilities';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from '../constants';

jest.mock('../utilities', () => ({
  getDateNow: jest.fn(() => Date.now()),
}));

jest.useFakeTimers();

describe('useRelativeTime()', () => {
  const Scale = ({ children }) => children;
  const Time = ({ children }) => children;
  const TimeDifference = ({ children }) => children;
  const TimeWithFormat = ({ children }) => children;

  const generateTestComponent = (targetTime, options) => {
    const TestComponent = () => {
      const { scale, time, timeDifference, timeWithFormat } = useRelativeTime(targetTime, options);

      return (
        <>
          <Scale>{scale}</Scale>
          <Time>{time}</Time>
          <TimeDifference>{timeDifference}</TimeDifference>
          <TimeWithFormat>{timeWithFormat}</TimeWithFormat>
        </>
      );
    };

    return TestComponent;
  };

  describe('time updates', () => {
    afterEach(() => {
      jest.clearAllTimers();
    });

    it.each([
      ['one second', ONE_SECOND, 60],
      ['one minute', ONE_MINUTE, 60],
      ['one hour', ONE_HOUR, 24],
      ['one day', ONE_DAY, 30],
      ['one month', ONE_MONTH, 12],
      ['one year', ONE_YEAR, 1],
    ])(
      `renders with the correct initial values up until the turn of context for %s`,
      (_, duration, numberInNextDuration) => {
        let now = Date.now();
        getDateNow.mockImplementation(() => now);
        const TestComponent = generateTestComponent(now);
        const wrapper = mount(
          <TimeProviders globalMinimumAccuracy={ONE_YEAR}>
            <TestComponent />
          </TimeProviders>
        );

        expect(wrapper.find(Scale).props()).toEqual({ children: ONE_SECOND });
        expect(wrapper.find(Time).props()).toEqual({ children: now });
        expect(wrapper.find(TimeDifference).props()).toEqual({ children: 0 });
        expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: now });

        for (let i = 1; i < numberInNextDuration; i++) {
          now = now + duration;
          getDateNow.mockImplementation(() => now);
          act(() => {
            jest.runOnlyPendingTimers();
          });
          wrapper.update();
          expect(wrapper.find(Scale).props()).toEqual({ children: duration });
          expect(wrapper.find(Time).props()).toEqual({ children: now });
          expect(wrapper.find(TimeDifference).props()).toEqual({ children: duration * i });
          expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: now });
        }
      }
    );

    it.each([['one second to one minute', ONE_SECOND, ONE_MINUTE]])(
      `renders with the correct values after the transition to a new context when moving from %s`,
      (_, initialDuration, finalDuration) => {
        let now = Date.now();
        const then = now - finalDuration + initialDuration;
        getDateNow.mockImplementation(() => now);
        const TestComponent = generateTestComponent(then);
        const wrapper = mount(
          <TimeProviders globalMinimumAccuracy={ONE_YEAR}>
            <TestComponent />
          </TimeProviders>
        );

        expect(wrapper.find(Scale).props()).toEqual({ children: initialDuration });
        expect(wrapper.find(Time).props()).toEqual({ children: now });
        expect(wrapper.find(TimeDifference).props()).toEqual({
          children: finalDuration - initialDuration,
        });
        expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: now });

        const nextNow = now + initialDuration;
        getDateNow.mockImplementation(() => nextNow);
        act(() => {
          jest.runOnlyPendingTimers();
        });
        wrapper.update();

        expect(wrapper.find(Scale).props()).toEqual({ children: finalDuration });
        expect(wrapper.find(Time).props()).toEqual({ children: nextNow });
        expect(wrapper.find(TimeDifference).props()).toEqual({
          children: finalDuration,
        });
        expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: nextNow });
      }
    );
  });
});
