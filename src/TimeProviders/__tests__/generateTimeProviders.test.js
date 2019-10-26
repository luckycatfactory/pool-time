import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { shallow, mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import generateTimeProviders from '../generateTimeProviders';
import * as durations from '../../durations';
import { ONE_SECOND, ONE_MINUTE, ONE_HOUR } from '../../durations';
import DurationsContext from '../DurationsContext';
import GlobalAccuracyContext from '../GlobalAccuracyContext';
import getDateNow from '../../utilities/getDateNow';

jest.mock('../../utilities/getDateNow', () => jest.fn(() => 0));

jest.useFakeTimers();

describe('generateTimeProviders()', () => {
  describe('component hierarchy', () => {
    const durationsInAscendingOrder = Object.values(durations).sort((a, b) =>
      a.value < b.value ? -1 : a.value === b.value ? 0 : 1
    );
    const durationsInDescendingOrder = durationsInAscendingOrder.reduce((accumulator, duration) => {
      accumulator.unshift(duration);
      return accumulator;
    }, []);
    const globalAccuracy = durationsInAscendingOrder.reduce((accumulator, duration) => {
      accumulator.push({
        difference: duration,
        maximumAccuracy: duration,
        minimumAccuracy: duration,
        preferredAccuracy: duration,
      });

      return accumulator;
    }, []);

    it('renders a <DurationsContext.Provider /> with the correct value', () => {
      const TimeProviders = generateTimeProviders(durationsInAscendingOrder, globalAccuracy);
      const wrapper = shallow(<TimeProviders>children</TimeProviders>);
      const durationsProvider = wrapper.find(DurationsContext.Provider);

      expect(durationsProvider).toHaveLength(1);
      expect(durationsProvider.prop('value').value).toEqual(durationsInAscendingOrder);
    });

    it('renders a <GlobalAccuracyContext.Provider /> with the correct value', () => {
      const TimeProviders = generateTimeProviders(durationsInAscendingOrder, globalAccuracy);
      const wrapper = shallow(<TimeProviders>children</TimeProviders>);
      const globalAccuracyProvider = wrapper.find(GlobalAccuracyContext.Provider);

      expect(globalAccuracyProvider).toHaveLength(1);
    });

    it('renders all duration providers in the correct order', () => {
      const TimeProviders = generateTimeProviders(durationsInAscendingOrder, globalAccuracy);
      let targetWrapper = shallow(<TimeProviders>children</TimeProviders>);

      let i = 0;
      do {
        const targetProvider = durationsInDescendingOrder[i].context.Provider;
        targetWrapper = targetWrapper.find(targetProvider);
        expect(targetWrapper).toHaveLength(1);
        i++;
      } while (i < durationsInDescendingOrder.length);
    });
  });

  describe('behavior', () => {
    const generateSimpleTestProviders = () =>
      generateTimeProviders(
        [ONE_SECOND, ONE_MINUTE, ONE_HOUR],
        [
          {
            difference: ONE_SECOND,
            maximumAccuracy: ONE_SECOND,
            minimumAccuracy: ONE_SECOND,
            preferredAccuracy: ONE_SECOND,
          },
          {
            difference: ONE_MINUTE,
            maximumAccuracy: ONE_MINUTE,
            minimumAccuracy: ONE_MINUTE,
            preferredAccuracy: ONE_MINUTE,
          },
          {
            difference: ONE_HOUR,
            maximumAccuracy: ONE_HOUR,
            minimumAccuracy: ONE_HOUR,
            preferredAccuracy: ONE_HOUR,
          },
        ]
      );

    const generateConsumerTester = duration => {
      const ConsumerTester = React.memo(() => {
        const targetContext = useContext(duration.context);

        useEffect(() => {
          targetContext.registerConsumer();

          return () => {
            targetContext.unregisterConsumer();
          };
        }, []);

        ConsumerTester.displayName = 'ConsumerTester';

        return targetContext.time;
      });

      return ConsumerTester;
    };

    const SecondConsumerTester = generateConsumerTester(ONE_SECOND);
    const MinuteConsumerTester = generateConsumerTester(ONE_MINUTE);
    const HourConsumerTester = generateConsumerTester(ONE_HOUR);

    const SimpleConsumerTester = React.memo(({ consumersToRemove }) => (
      <>
        {!consumersToRemove.has(SecondConsumerTester) && <SecondConsumerTester />}
        {!consumersToRemove.has(MinuteConsumerTester) && <MinuteConsumerTester />}
        {!consumersToRemove.has(HourConsumerTester) && <HourConsumerTester />}
      </>
    ));

    SimpleConsumerTester.displayName = 'SimpleConsumerTester';
    SimpleConsumerTester.propTypes = {
      consumersToRemove: PropTypes.instanceOf(Set),
    };
    SimpleConsumerTester.defaultProps = {
      consumersToRemove: new Set(),
    };

    const generateDynamicConsumerTester = (TimeProviders, timeProvidersProps = {}) => {
      const DynamicConsumerTester = React.memo(({ consumersToRemove }) => (
        <TimeProviders {...timeProvidersProps}>
          <SimpleConsumerTester consumersToRemove={consumersToRemove} />
        </TimeProviders>
      ));

      DynamicConsumerTester.propTypes = {
        consumersToRemove: PropTypes.instanceOf(Set),
      };

      DynamicConsumerTester.defaultProps = {
        consumersToRemove: new Set(),
      };

      DynamicConsumerTester.displayName = 'DynamicConsumerTester';

      return DynamicConsumerTester;
    };

    const getCurrentSecondsTime = wrapper => Number(wrapper.find(SecondConsumerTester).text());
    const getCurrentMinutesTime = wrapper => Number(wrapper.find(MinuteConsumerTester).text());
    const getCurrentHoursTime = wrapper => Number(wrapper.find(HourConsumerTester).text());

    const moveTimeForward = (wrapper, initialTime, timeToAdvanceBy) => {
      const nextTime = initialTime + timeToAdvanceBy;
      getDateNow.mockReturnValue(nextTime);

      act(() => {
        jest.advanceTimersByTime(timeToAdvanceBy);
      });
      wrapper.update();

      return nextTime;
    };

    beforeEach(() => {
      getDateNow.mockReset();
    });

    describe('time updates', () => {
      it('initially loads providers with the correct values', () => {
        const initialTime = 0;
        getDateNow.mockReturnValue(initialTime);
        const TimeProviders = generateSimpleTestProviders();
        const wrapper = mount(
          <TimeProviders>
            <SimpleConsumerTester />
          </TimeProviders>
        );

        expect(getCurrentSecondsTime(wrapper)).toBe(initialTime);
        expect(getCurrentMinutesTime(wrapper)).toBe(initialTime);
        expect(getCurrentHoursTime(wrapper)).toBe(initialTime);
      });

      it('only updates times that require an update', () => {
        const initialTime = ONE_MINUTE.value - ONE_SECOND.value - 1;
        getDateNow.mockReturnValue(initialTime);
        const TimeProviders = generateSimpleTestProviders();
        const wrapper = mount(
          <TimeProviders>
            <SimpleConsumerTester />
          </TimeProviders>
        );

        const secondTime = moveTimeForward(wrapper, initialTime, 1000);

        expect(getCurrentSecondsTime(wrapper)).toBe(secondTime);
        expect(getCurrentMinutesTime(wrapper)).toBe(initialTime);
        expect(getCurrentHoursTime(wrapper)).toBe(initialTime);
      });

      it('updates more extended times that happen to change during the tick', () => {
        const initialTime = ONE_HOUR.value - ONE_SECOND.value;
        getDateNow.mockReturnValue(initialTime);
        const TimeProviders = generateSimpleTestProviders();
        const wrapper = mount(
          <TimeProviders>
            <SimpleConsumerTester />
          </TimeProviders>
        );

        const timeAtExactMomentOfNextMinute = moveTimeForward(wrapper, initialTime, 1000);

        expect(getCurrentSecondsTime(wrapper)).toBe(timeAtExactMomentOfNextMinute);
        expect(getCurrentMinutesTime(wrapper)).toBe(timeAtExactMomentOfNextMinute);
        expect(getCurrentHoursTime(wrapper)).toBe(timeAtExactMomentOfNextMinute);
      });
    });

    describe('onIntervalUpdate()', () => {
      it('properly gets invoked on initialization', () => {
        const mockOnIntervalUpdate = jest.fn();
        const TimeProviders = generateSimpleTestProviders();
        mount(
          <TimeProviders onIntervalUpdate={mockOnIntervalUpdate}>
            (no consumers rendered)
          </TimeProviders>
        );

        expect(mockOnIntervalUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnIntervalUpdate).toHaveBeenLastCalledWith(null);
      });

      it('properly gets called when a consumer registers', () => {
        const mockOnIntervalUpdate = jest.fn();
        const TimeProviders = generateSimpleTestProviders();
        const DynamicConsumerTester = generateDynamicConsumerTester(TimeProviders, {
          onIntervalUpdate: mockOnIntervalUpdate,
        });

        mount(
          <DynamicConsumerTester
            consumersToRemove={new Set([MinuteConsumerTester, HourConsumerTester])}
          />
        );

        expect(mockOnIntervalUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnIntervalUpdate).toHaveBeenLastCalledWith(ONE_SECOND.value);
      });

      it('properly gets called when the interval changes', () => {
        const mockOnIntervalUpdate = jest.fn();
        const TimeProviders = generateSimpleTestProviders();
        const DynamicConsumerTester = generateDynamicConsumerTester(TimeProviders, {
          onIntervalUpdate: mockOnIntervalUpdate,
        });

        const wrapper = mount(<DynamicConsumerTester />);

        // The assumption here is that removing the one second consumer will
        // bump the interval up to the minute.
        wrapper.setProps({
          consumersToRemove: new Set([SecondConsumerTester]),
        });

        expect(mockOnIntervalUpdate).toHaveBeenCalledTimes(3);
        expect(mockOnIntervalUpdate).toHaveBeenLastCalledWith(ONE_MINUTE.value);
      });
    });

    describe('onRegistrationsUpdate()', () => {
      it('properly gets invoked on initialization', () => {
        const mockOnRegistrationsUpdate = jest.fn();
        const TimeProviders = generateSimpleTestProviders();
        mount(
          <TimeProviders onRegistrationsUpdate={mockOnRegistrationsUpdate}>
            (no consumers rendered)
          </TimeProviders>
        );

        expect(mockOnRegistrationsUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnRegistrationsUpdate).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: 0,
          [ONE_MINUTE.key]: 0,
          [ONE_HOUR.key]: 0,
        });
      });

      it('properly gets invoked when consumers register', () => {
        const mockOnRegistrationsUpdate = jest.fn();
        const TimeProviders = generateSimpleTestProviders();
        mount(
          <TimeProviders onRegistrationsUpdate={mockOnRegistrationsUpdate}>
            <SimpleConsumerTester />
          </TimeProviders>
        );

        expect(mockOnRegistrationsUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnRegistrationsUpdate).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: 1,
          [ONE_MINUTE.key]: 1,
          [ONE_HOUR.key]: 1,
        });
      });

      it('properly gets invoked when consumers unregister', () => {
        const mockOnRegistrationsUpdate = jest.fn();
        const TimeProviders = generateSimpleTestProviders();
        const DynamicConsumerTester = generateDynamicConsumerTester(TimeProviders, {
          onRegistrationsUpdate: mockOnRegistrationsUpdate,
        });

        const wrapper = mount(<DynamicConsumerTester />);

        wrapper.setProps({
          consumersToRemove: new Set([
            SecondConsumerTester,
            MinuteConsumerTester,
            HourConsumerTester,
          ]),
        });

        expect(mockOnRegistrationsUpdate).toHaveBeenCalledTimes(3);
        expect(mockOnRegistrationsUpdate).toHaveBeenLastCalledWith({
          [ONE_SECOND.key]: 0,
          [ONE_MINUTE.key]: 0,
          [ONE_HOUR.key]: 0,
        });
      });
    });
  });
});
