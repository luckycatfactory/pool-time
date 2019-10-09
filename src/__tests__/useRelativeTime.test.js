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

// What follows is essentially integration tests between useRelativeTime and TimeProviders and all
// dependencies.
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

  describe('registrations', () => {
    const generateExpectedRegistrationObject = (overrides = {}) => ({
      day: 0,
      hour: 0,
      minute: 0,
      month: 0,
      second: 0,
      year: 0,
      ...overrides,
    });
    const generateUnmountableTestComponent = (TestComponent, handleRegistrationsUpdate) => {
      // eslint-disable-next-line react/prop-types
      const UnmountableTestComponent = ({ hasTestComponent }) => (
        <TimeProviders
          onRegistrationsUpdate={handleRegistrationsUpdate}
          globalMinimumAccuracy={ONE_YEAR}
        >
          {hasTestComponent && <TestComponent />}
        </TimeProviders>
      );

      return UnmountableTestComponent;
    };

    describe.each([
      ['second', ONE_SECOND],
      ['minute', ONE_MINUTE],
      ['hour', ONE_HOUR],
      ['day', ONE_DAY],
      ['month', ONE_MONTH],
      ['year', ONE_YEAR],
    ])('when updating the registration for %s', (key, duration) => {
      it('calls onRegistrationsUpdate with the correct registration state when mounting', () => {
        const now = Date.now() - duration;
        const TestComponent = generateTestComponent(now);
        const handleRegistrationsUpdate = jest.fn();
        const UnmountableTestComponent = generateUnmountableTestComponent(
          TestComponent,
          handleRegistrationsUpdate
        );

        mount(<UnmountableTestComponent hasTestComponent />);
        expect(handleRegistrationsUpdate).toHaveBeenCalledTimes(2);
        expect(handleRegistrationsUpdate).toHaveBeenNthCalledWith(
          1,
          generateExpectedRegistrationObject()
        );
        expect(handleRegistrationsUpdate).toHaveBeenNthCalledWith(
          2,
          generateExpectedRegistrationObject({
            [key]: 1,
          })
        );
      });

      it(`calls onRegistrationsUpdate with the correct registration state when unmounting`, () => {
        const now = Date.now() - duration;
        const TestComponent = generateTestComponent(now);
        const handleRegistrationsUpdate = jest.fn();
        const UnmountableTestComponent = generateUnmountableTestComponent(
          TestComponent,
          handleRegistrationsUpdate
        );

        const wrapper = mount(<UnmountableTestComponent hasTestComponent />);
        const testComponent = wrapper.find(TestComponent);
        expect(testComponent).toHaveLength(1);

        handleRegistrationsUpdate.mockClear();

        wrapper.setProps({ hasTestComponent: false });

        expect(wrapper.find(TestComponent)).toHaveLength(0);

        expect(handleRegistrationsUpdate).toHaveBeenLastCalledWith(
          generateExpectedRegistrationObject()
        );
      });
    });
  });

  describe('time updates', () => {
    afterEach(() => {
      jest.clearAllTimers();
    });

    describe('when the target times are in the past', () => {
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

      it.each([
        ['one second to one minute', ONE_SECOND, ONE_MINUTE],
        ['one minute to one hour', ONE_MINUTE, ONE_HOUR],
        ['one hour to one day', ONE_HOUR, ONE_DAY],
        ['one day to one month', ONE_DAY, ONE_MONTH],
        ['one month to one year', ONE_MONTH, ONE_YEAR],
      ])(
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

    describe('when the target times are in the future', () => {
      it.each([
        ['one second', ONE_SECOND, 60],
        ['one minute', ONE_MINUTE, 60],
        ['one hour', ONE_HOUR, 24],
        ['one day', ONE_DAY, 30],
        ['one month', ONE_MONTH, 12],
        ['one year', ONE_YEAR, 2],
      ])(
        `renders with the correct initial values up until the turn of context for %s`,
        (_, duration, numberInDuration) => {
          let now = Date.now();
          getDateNow.mockImplementation(() => now);
          const targetTime = now + duration * numberInDuration;
          const TestComponent = generateTestComponent(targetTime);
          const wrapper = mount(
            <TimeProviders globalMinimumAccuracy={ONE_YEAR}>
              <TestComponent />
            </TimeProviders>
          );

          expect(wrapper.find(Scale).props()).toEqual({ children: duration });
          expect(wrapper.find(Time).props()).toEqual({ children: now });
          expect(wrapper.find(TimeDifference).props()).toEqual({
            children: 0 - duration * numberInDuration,
          });
          expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: now });

          for (let i = 1; i < numberInDuration - 1; i++) {
            now = now + duration;
            getDateNow.mockImplementation(() => now);
            act(() => {
              jest.runOnlyPendingTimers();
            });
            wrapper.update();
            expect(wrapper.find(Scale).props()).toEqual({ children: duration });
            expect(wrapper.find(Time).props()).toEqual({ children: now });
            expect(wrapper.find(TimeDifference).props()).toEqual({
              children: 0 - duration * numberInDuration + duration * i,
            });
            expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: now });
          }
        }
      );

      it.each([
        ['one minute to one second', ONE_SECOND, ONE_MINUTE],
        ['one hour to one minute', ONE_MINUTE, ONE_HOUR],
        ['one day to one hour', ONE_HOUR, ONE_DAY],
        ['one month to one day', ONE_DAY, ONE_MONTH],
        ['one year to one month', ONE_MONTH, ONE_YEAR],
      ])(
        `renders with the correct initial values after the transition to a new context for %s`,
        (_, finalDuration, initialDuration) => {
          let now = Date.now();
          getDateNow.mockImplementation(() => now);
          const targetTime = now + initialDuration * 2;
          const TestComponent = generateTestComponent(targetTime);
          const wrapper = mount(
            <TimeProviders globalMinimumAccuracy={ONE_YEAR}>
              <TestComponent />
            </TimeProviders>
          );

          expect(wrapper.find(Scale).props()).toEqual({ children: initialDuration });
          expect(wrapper.find(Time).props()).toEqual({ children: now });
          expect(wrapper.find(TimeDifference).props()).toEqual({
            children: 0 - initialDuration * 2,
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
            children: 0 - initialDuration,
          });
          expect(wrapper.find(TimeWithFormat).props()).toEqual({ children: nextNow });
        }
      );
    });

    describe('globalMinimumAccuracy', () => {
      xit.each([
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
    });
  });
});
