import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';

import useRelativeTime from '..';
import { getDateNow } from '../../utilities';
import { ONE_SECOND } from '../../durations';
import GlobalAccuracyContext from '../../TimeProviders/GlobalAccuracyContext';
import DurationsContext from '../../TimeProviders/DurationsContext';
import { AccuracyList, AccuracyMap, DurationList } from '../../classes';

jest.mock('../../utilities/getDateNow', () => jest.fn(() => 0));

jest.useFakeTimers();

describe('useRelativeTime()', () => {
  const generateRelativeTimePropertyRenderer = name => {
    const RelativeTimePropertyRenderer = React.memo(({ children }) => children);

    RelativeTimePropertyRenderer.displayName = `${name}Renderer`;

    RelativeTimePropertyRenderer.propTypes = {
      children: PropTypes.node.isRequired,
    };

    return RelativeTimePropertyRenderer;
  };

  const Duration = generateRelativeTimePropertyRenderer('Duration');
  const Time = generateRelativeTimePropertyRenderer('Time');
  const TimeDifference = generateRelativeTimePropertyRenderer('TimeDifference');
  const TimeWithFormat = generateRelativeTimePropertyRenderer('TimeWithFormat');

  const generateUseRelativeTimeTester = (targetTime, options = {}) => {
    const UseRelativeTimeTester = React.memo(() => {
      const relativeTimeObject = useRelativeTime(targetTime, options);

      return (
        <>
          <Duration>{relativeTimeObject.duration.key}</Duration>
          <Time>{relativeTimeObject.time}</Time>
          <TimeDifference>{relativeTimeObject.timeDifference}</TimeDifference>
          <TimeWithFormat>{relativeTimeObject.timeWithFormat}</TimeWithFormat>
        </>
      );
    });

    UseRelativeTimeTester.displayName = 'UseRelativeTimeTester';

    return UseRelativeTimeTester;
  };

  describe('initialization', () => {
    describe('when there is no difference', () => {
      it('returns a valid relative time object when there is no time formatter', () => {
        const UseRelativeTimeTester = generateUseRelativeTimeTester(getDateNow());

        const durationList = new DurationList([ONE_SECOND]);

        const accuracyMap = new AccuracyMap(
          durationList,
          new AccuracyList([
            {
              difference: ONE_SECOND,
              maximumAccuracy: ONE_SECOND,
              minimumAccuracy: ONE_SECOND,
              preferredAccuracy: ONE_SECOND,
            },
          ])
        );

        const wrapper = mount(
          <DurationsContext.Provider value={durationList}>
            <GlobalAccuracyContext.Provider value={accuracyMap}>
              <UseRelativeTimeTester />
            </GlobalAccuracyContext.Provider>
          </DurationsContext.Provider>
        );

        expect(wrapper.find(Duration).prop('children')).toBe('oneSecond');
        expect(wrapper.find(Time).prop('children')).toBe(0);
        expect(wrapper.find(TimeDifference).prop('children')).toBe(0);
        expect(wrapper.find(TimeWithFormat).prop('children')).toBe(0);
      });

      it('returns a valid relative time object when there is a time formatter', () => {
        const UseRelativeTimeTester = generateUseRelativeTimeTester(getDateNow(), {
          timeFormatter: number => String(number),
        });

        const durationList = new DurationList([ONE_SECOND]);

        const accuracyMap = new AccuracyMap(
          durationList,
          new AccuracyList([
            {
              difference: ONE_SECOND,
              maximumAccuracy: ONE_SECOND,
              minimumAccuracy: ONE_SECOND,
              preferredAccuracy: ONE_SECOND,
            },
          ])
        );

        const wrapper = mount(
          <DurationsContext.Provider value={durationList}>
            <GlobalAccuracyContext.Provider value={accuracyMap}>
              <UseRelativeTimeTester />
            </GlobalAccuracyContext.Provider>
          </DurationsContext.Provider>
        );

        expect(wrapper.find(Duration).prop('children')).toBe('oneSecond');
        expect(wrapper.find(Time).prop('children')).toBe(0);
        expect(wrapper.find(TimeDifference).prop('children')).toBe(0);
        expect(wrapper.find(TimeWithFormat).prop('children')).toBe('0');
      });
    });
  });
});
