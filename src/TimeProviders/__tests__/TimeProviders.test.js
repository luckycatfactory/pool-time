import React, { useContext, useEffect } from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import TimeProviders from '..';
import GlobalAccuracyContext from '../GlobalAccuracyContext';
import { ONE_DAY, ONE_HOUR, ONE_MINUTE, ONE_SECOND } from '../../durations';
import getDateNow from '../../utilities/getDateNow';

jest.mock('../../utilities/getDateNow', () => jest.fn(() => Date.now()));

jest.useFakeTimers();

describe('<TimeProviders />', () => {
  const Duration = ({ children }) => children;
  const Time = ({ children }) => children;
  const generateTimeRenderer = namePrefix => {
    const rendererObj = {};
    const fullComponentName = `${namePrefix}TimeRenderer`;
    // eslint-disable-next-line react/prop-types
    const Renderer = ({ duration, registerConsumer, time, unregisterConsumer }) => {
      useEffect(() => {
        registerConsumer();

        return () => {
          unregisterConsumer();
        };
      }, []);

      return (
        <>
          <Duration>{duration}</Duration>
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
  const SecondRenderer = generateTimeRenderer('Second');
  const allTimeRenderersWithDurations = [
    [DayRenderer, ONE_DAY],
    [HourRenderer, ONE_HOUR],
    [MinuteRenderer, ONE_MINUTE],
    [SecondRenderer, ONE_SECOND],
  ];
  const generateProviderTester = () => {
    const ProviderTester = () => {
      const globalMinimumAccuracy = useContext(GlobalAccuracyContext);
      const dayContext = useContext(ONE_DAY.context);
      const hourContext = useContext(ONE_HOUR.context);
      const minuteContext = useContext(ONE_MINUTE.context);
      const secondContext = useContext(ONE_SECOND.context);

      return (
        <>
          <GlobalMinimumAccuracyRenderer>
            {globalMinimumAccuracy.value}
          </GlobalMinimumAccuracyRenderer>
          <DayRenderer {...dayContext} />
          <HourRenderer {...hourContext} />
          <MinuteRenderer {...minuteContext} />
          <SecondRenderer {...secondContext} />
        </>
      );
    };
    return ProviderTester;
  };

  afterEach(() => {
    jest.clearAllTimers();
  });

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

      expect(wrapper.find(GlobalMinimumAccuracyRenderer).props()).toEqual({
        children: ONE_MINUTE.value,
      });
    });

    it('passes the correct set values', () => {
      allTimeRenderersWithDurations.forEach(([_, duration]) => {
        const ProviderTester = generateProviderTester();
        const wrapper = mount(
          <TimeProviders globalMinimumAccuracy={duration}>
            <ProviderTester />
          </TimeProviders>
        );

        expect(wrapper.find(GlobalMinimumAccuracyRenderer).props()).toEqual({
          children: duration.value,
        });
      });
    });

    it('throws the correct error when an invalid minimum is provided', () => {
      const ProviderTester = generateProviderTester();
      expect(() => {
        mount(
          <TimeProviders globalMinimumAccuracy={1000}>
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
            <Duration>{targetContext.duration}</Duration>
            <Time>{targetContext.time}</Time>
          </>
        );
      };

      return SingleConsumerTester;
    };
    const generateExpectedRegistrationObject = (overrides = {}) => ({
      oneDay: 0,
      oneHour: 0,
      oneMinute: 0,
      oneSecond: 0,
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

    it('passes the correct initial duration and time to each time renderer', () => {
      const now = Date.now();
      getDateNow.mockImplementation(() => now);
      allTimeRenderersWithDurations.forEach(([renderer, expectedDuration]) => {
        const ProviderTester = generateProviderTester();
        const wrapper = mount(
          <TimeProviders>
            <ProviderTester />
          </TimeProviders>
        );
        const timeRenderer = wrapper.find(renderer);
        expect(timeRenderer).toHaveLength(1);
        const duration = timeRenderer.find(Duration);
        const time = timeRenderer.find(Time);
        expect(duration.props()).toEqual({ children: expectedDuration.value });
        expect(time.props()).toEqual({ children: now });
      });
    });

    describe('context value changes', () => {
      describe.each([
        [ONE_SECOND.key, ONE_SECOND],
        [ONE_MINUTE.key, ONE_MINUTE],
        [ONE_HOUR.key, ONE_HOUR],
        [ONE_DAY.key, ONE_DAY],
      ])(`when there is a single %s consumer`, (key, duration) => {
        afterEach(() => {
          jest.clearAllTimers();
        });

        it('should initially call onRegistrationsUpdate with the correct value', () => {
          const SingleConsumerTester = generateSingleConsumerTester(duration.context);
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
          const SingleConsumerTester = generateSingleConsumerTester(duration.context);
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
          const SingleConsumerTester = generateSingleConsumerTester(duration.context);
          const wrapper = mount(
            <TimeProviders>
              <SingleConsumerTester />
            </TimeProviders>
          );

          const time = wrapper.find(Time);
          expect(time.props()).toEqual({ children: now });

          const nextNow = now + duration;
          getDateNow.mockImplementation(() => nextNow);
          act(() => {
            jest.runOnlyPendingTimers();
          });
          wrapper.update();

          expect(time.props()).toEqual({ children: now });
          act(() => {
            jest.runOnlyPendingTimers();
          });
          wrapper.update();

          const secondTime = wrapper.find(Time);
          expect(secondTime.props()).toEqual({ children: nextNow });
        });
      });
    });
  });
});
