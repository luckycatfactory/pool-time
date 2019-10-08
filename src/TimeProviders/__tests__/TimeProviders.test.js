import React, { useContext, useEffect } from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import TimeProviders from '../';
import DayContext from '../DayContext';
import GlobalMinimumAccuracyContext from '../GlobalMinimumAccuracyContext';
import HourContext from '../HourContext';
import MinuteContext from '../MinuteContext';
import MonthContext from '../MonthContext';
import SecondContext from '../SecondContext';
import YearContext from '../YearContext';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_MONTH, ONE_SECOND, ONE_YEAR } from '../../constants';
import { getDateNow } from '../../utilities';

jest.mock('../../utilities', () => ({
  getDateNow: jest.fn(() => Date.now()),
}));

jest.useFakeTimers();

describe('<TimeProviders />', () => {
  const Scale = ({ children }) => children;
  const Time = ({ children }) => children;
  const generateTimeRenderer = namePrefix => {
    const rendererObj = {};
    const fullComponentName = `${namePrefix}TimeRenderer`;
    // eslint-disable-next-line react/prop-types
    const Renderer = ({ registerConsumer, scale, time, unregisterConsumer }) => {
      useEffect(() => {
        registerConsumer();

        return () => {
          unregisterConsumer();
        };
      }, []);

      return (
        <>
          <Scale>{scale}</Scale>
          <Time>{time}</Time>
        </>
      );
    };
    Renderer.displayName = fullComponentName;
    rendererObj[fullComponentName] = Renderer;

    return rendererObj[fullComponentName];
  };
  const GlobalMinimumAccuracyRenderer = ({ children }) => children;
  const DayRenderer = generateTimeRenderer('Day');
  const HourRenderer = generateTimeRenderer('Hour');
  const MinuteRenderer = generateTimeRenderer('Minute');
  const MonthRenderer = generateTimeRenderer('Month');
  const SecondRenderer = generateTimeRenderer('Second');
  const YearRenderer = generateTimeRenderer('Year');
  const allTimeRenderersWithScales = [
    [DayRenderer, ONE_DAY],
    [HourRenderer, ONE_HOUR],
    [MinuteRenderer, ONE_MINUTE],
    [MonthRenderer, ONE_MONTH],
    [SecondRenderer, ONE_SECOND],
    [YearRenderer, ONE_YEAR],
  ];
  const generateProviderTester = () => {
    const ProviderTester = () => {
      const globalMinimumAccuracy = useContext(GlobalMinimumAccuracyContext);
      const dayContext = useContext(DayContext);
      const hourContext = useContext(HourContext);
      const minuteContext = useContext(MinuteContext);
      const monthContext = useContext(MonthContext);
      const secondContext = useContext(SecondContext);
      const yearContext = useContext(YearContext);

      return (
        <>
          <GlobalMinimumAccuracyRenderer>{globalMinimumAccuracy}</GlobalMinimumAccuracyRenderer>
          <DayRenderer {...dayContext} />
          <HourRenderer {...hourContext} />
          <MinuteRenderer {...minuteContext} />
          <MonthRenderer {...monthContext} />
          <SecondRenderer {...secondContext} />
          <YearRenderer {...yearContext} />
        </>
      );
    };
    return ProviderTester;
  };

  it('renders its children', () => {
    const wrapper = mount(<TimeProviders>Children</TimeProviders>);

    expect(wrapper.text()).toBe('Children');
  });

  describe('global minimum accuracy', () => {
    it('passes the correct default value', () => {
      const ProviderTester = generateProviderTester();
      const wrapper = mount(
        <TimeProviders>
          <ProviderTester />
        </TimeProviders>
      );

      expect(wrapper.find(GlobalMinimumAccuracyRenderer).props()).toEqual({ children: ONE_MINUTE });
    });

    it('passes the correct set values', () => {
      allTimeRenderersWithScales.forEach(([_, duration]) => {
        const ProviderTester = generateProviderTester();
        const wrapper = mount(
          <TimeProviders globalMinimumAccuracy={duration}>
            <ProviderTester />
          </TimeProviders>
        );

        expect(wrapper.find(GlobalMinimumAccuracyRenderer).props()).toEqual({
          children: duration,
        });
      });
    });

    it('throws the correct error when an invalid minimum is provided', () => {
      const ProviderTester = generateProviderTester();
      expect(() => {
        mount(
          <TimeProviders globalMinimumAccuracy={1}>
            <ProviderTester />
          </TimeProviders>
        );
      }).toThrow('globalMinimumAccuracy must be a valid duration');
    });
  });

  describe('provided context updates', () => {
    const generateSingleConsumerTester = TargetContext => {
      const SingleConsumerTester = () => {
        const targetContext = useContext(TargetContext);

        useEffect(() => {
          targetContext.registerConsumer();

          return () => {
            targetContext.unregisterConsumer();
          };
        }, []);

        return (
          <>
            <Scale>{targetContext.scale}</Scale>
            <Time>{targetContext.time}</Time>
          </>
        );
      };

      return SingleConsumerTester;
    };
    const generateExpectedRegistrationObject = (overrides = {}) => ({
      day: 0,
      hour: 0,
      minute: 0,
      month: 0,
      second: 0,
      year: 0,
      ...overrides,
    });

    it('should initially call onIntervalUpdate at the beginning with null and not again when there are no consumers', () => {
      const mockOnIntervalUpdate = jest.fn();
      mount(<TimeProviders onIntervalUpdate={mockOnIntervalUpdate}>Children</TimeProviders>);
      expect(mockOnIntervalUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnIntervalUpdate).toHaveBeenLastCalledWith(null);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockOnIntervalUpdate).toHaveBeenCalledTimes(1);
    });

    it('passes the correct initial scale and time to each time renderer', () => {
      const now = Date.now();
      getDateNow.mockImplementation(() => now);
      allTimeRenderersWithScales.forEach(([renderer, expectedScale]) => {
        const ProviderTester = generateProviderTester();
        const wrapper = mount(
          <TimeProviders>
            <ProviderTester />
          </TimeProviders>
        );
        const timeRenderer = wrapper.find(renderer);
        expect(timeRenderer).toHaveLength(1);
        const scale = timeRenderer.find(Scale);
        const time = timeRenderer.find(Time);
        expect(scale.props()).toEqual({ children: expectedScale });
        expect(time.props()).toEqual({ children: now });
      });
    });

    describe('context value changes', () => {
      describe.each([
        ['second', SecondContext, ONE_SECOND],
        ['minute', MinuteContext, ONE_MINUTE],
        ['hour', HourContext, ONE_HOUR],
        ['day', DayContext, ONE_DAY],
        ['month', MonthContext, ONE_MONTH],
        ['year', YearContext, ONE_YEAR],
      ])(`when there is a single %s consumer`, (key, context, duration) => {
        afterEach(() => {
          jest.clearAllTimers();
        });

        it('should initially call onRegistrationsUpdate with the correct value', () => {
          const SingleConsumerTester = generateSingleConsumerTester(context);
          const mockOnRegistrationUpdate = jest.fn();
          mount(
            <TimeProviders onRegistrationsUpdate={mockOnRegistrationUpdate}>
              <SingleConsumerTester />
            </TimeProviders>
          );
          expect(mockOnRegistrationUpdate).toHaveBeenCalledTimes(2);
          expect(mockOnRegistrationUpdate).toHaveBeenCalledWith(
            generateExpectedRegistrationObject()
          );
          expect(mockOnRegistrationUpdate).toHaveBeenLastCalledWith(
            generateExpectedRegistrationObject({ [key]: 1 })
          );
        });

        it('should call onRegistrationUpdate with the registrations removed when they are unmounted', () => {
          const SingleConsumerTester = generateSingleConsumerTester(context);
          const DynamicConsumerWrapper = ({ children, shouldRenderConsumer }) =>
            children({ shouldRenderConsumer });
          const mockOnRegistrationUpdate = jest.fn();
          const wrapper = mount(
            <DynamicConsumerWrapper shouldRenderConsumer>
              {({ shouldRenderConsumer }) => (
                <TimeProviders onRegistrationsUpdate={mockOnRegistrationUpdate}>
                  {shouldRenderConsumer && <SingleConsumerTester />}
                </TimeProviders>
              )}
            </DynamicConsumerWrapper>
          );
          expect(mockOnRegistrationUpdate).toHaveBeenCalledTimes(2);
          expect(mockOnRegistrationUpdate).toHaveBeenCalledWith(
            generateExpectedRegistrationObject()
          );
          expect(mockOnRegistrationUpdate).toHaveBeenLastCalledWith(
            generateExpectedRegistrationObject({ [key]: 1 })
          );
          wrapper.setProps({ shouldRenderConsumer: false });
          expect(mockOnRegistrationUpdate).toHaveBeenCalledTimes(3);
          expect(mockOnRegistrationUpdate).toHaveBeenLastCalledWith(
            generateExpectedRegistrationObject()
          );
        });

        it('correctly updates the passed time when it should', () => {
          const now = Date.now();
          getDateNow.mockImplementation(() => now);
          const SingleConsumerTester = generateSingleConsumerTester(context);
          const wrapper = mount(
            <TimeProviders>
              <SingleConsumerTester />
            </TimeProviders>
          );

          const time = wrapper.find(Time);
          expect(time.props()).toEqual({ children: now });

          const nextNow = now + duration;
          getDateNow.mockImplementation(() => nextNow);
          // Unfortunately, advancing time by a year causes so many timers to be created that we
          // can't perform this check.
          if (duration < ONE_YEAR) {
            act(() => {
              jest.advanceTimersByTime(duration - 1);
            });
            wrapper.update();

            expect(time.props()).toEqual({ children: now });
          }
          act(() => {
            if (duration < ONE_YEAR) {
              jest.advanceTimersByTime(1);
            } else {
              jest.runOnlyPendingTimers();
            }
          });
          wrapper.update();

          const secondTime = wrapper.find(Time);
          expect(secondTime.props()).toEqual({ children: nextNow });
        });
      });
    });
  });
});
