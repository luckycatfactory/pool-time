import React from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';

import { ONE_SECOND, ONE_MINUTE, ONE_HOUR } from '../../durations';
import { AccuracyList } from '../../classes';
import DurationsContext from '../../TimeProviders/DurationsContext';
import GlobalAccuracyContext from '../../TimeProviders/GlobalAccuracyContext';

import useLocalAccuracy from '../useLocalAccuracy';

describe('useLocalAccuracy()', () => {
  const generateAccuracyPropertyRenderer = name => {
    const AccuracyPropertyRenderer = React.memo(({ children }) => children);

    AccuracyPropertyRenderer.displayName = `${name}AccuracyPropertyRenderer`;

    AccuracyPropertyRenderer.propTypes = {
      children: PropTypes.node.isRequired,
    };

    return AccuracyPropertyRenderer;
  };
  const Difference = generateAccuracyPropertyRenderer('Difference');
  const MaximumAccuracy = generateAccuracyPropertyRenderer('MaximumAccuracy');
  const MinimumAccuracy = generateAccuracyPropertyRenderer('MinimumAccuracy');
  const PreferredAccuracy = generateAccuracyPropertyRenderer('PreferredAccuracy');

  const generateAccuracyEntryRenderer = name => {
    const AccuracyEntryRenderer = React.memo(({ children }) => children);

    AccuracyEntryRenderer.displayName = `${name}AccuracyEntryRenderer`;

    AccuracyEntryRenderer.propTypes = {
      children: PropTypes.node.isRequired,
    };

    return AccuracyEntryRenderer;
  };

  const SecondAccuracyEntry = generateAccuracyEntryRenderer('Second');
  const MinuteAccuracyEntry = generateAccuracyEntryRenderer('Minute');
  const HourAccuracyEntry = generateAccuracyEntryRenderer('Hour');

  const generateLocalAccuracyTester = () => {
    const LocalAccuracyRenderer = React.memo(() => {
      const localAccuracy = useLocalAccuracy(() => [
        {
          difference: ONE_SECOND,
          maximumAccuracy: ONE_SECOND,
          minimumAccuracy: ONE_SECOND,
          preferredAccuracy: ONE_SECOND,
        },
        {
          difference: ONE_HOUR,
          maximumAccuracy: ONE_SECOND,
          minimumAccuracy: ONE_HOUR,
          preferredAccuracy: ONE_MINUTE,
        },
      ]);

      return (
        <>
          <SecondAccuracyEntry>
            <Difference>{localAccuracy.value.oneSecond.difference.value}</Difference>
            <MaximumAccuracy>{localAccuracy.value.oneSecond.maximumAccuracy.value}</MaximumAccuracy>
            <MinimumAccuracy>{localAccuracy.value.oneSecond.minimumAccuracy.value}</MinimumAccuracy>
            <PreferredAccuracy>
              {localAccuracy.value.oneSecond.preferredAccuracy.value}
            </PreferredAccuracy>
          </SecondAccuracyEntry>
          <MinuteAccuracyEntry>
            <Difference>{localAccuracy.value.oneMinute.difference.value}</Difference>
            <MaximumAccuracy>{localAccuracy.value.oneMinute.maximumAccuracy.value}</MaximumAccuracy>
            <MinimumAccuracy>{localAccuracy.value.oneMinute.minimumAccuracy.value}</MinimumAccuracy>
            <PreferredAccuracy>
              {localAccuracy.value.oneMinute.preferredAccuracy.value}
            </PreferredAccuracy>
          </MinuteAccuracyEntry>
          <HourAccuracyEntry>
            <Difference>{localAccuracy.value.oneHour.difference.value}</Difference>
            <MaximumAccuracy>{localAccuracy.value.oneHour.maximumAccuracy.value}</MaximumAccuracy>
            <MinimumAccuracy>{localAccuracy.value.oneHour.minimumAccuracy.value}</MinimumAccuracy>
            <PreferredAccuracy>
              {localAccuracy.value.oneHour.preferredAccuracy.value}
            </PreferredAccuracy>
          </HourAccuracyEntry>
        </>
      );
    });

    LocalAccuracyRenderer.displayName = 'LocalAccuracyRenderer';

    const LocalAccuracyTester = React.memo(() => (
      <GlobalAccuracyContext.Provider
        value={
          new AccuracyList([
            {
              difference: ONE_SECOND,
              maximumAccuracy: ONE_SECOND,
              minimumAccuracy: ONE_SECOND,
              preferredAccuracy: ONE_SECOND,
            },
            {
              difference: ONE_HOUR,
              maximumAccuracy: ONE_SECOND,
              minimumAccuracy: ONE_HOUR,
              preferredAccuracy: ONE_MINUTE,
            },
          ])
        }
      >
        <DurationsContext.Provider value={[ONE_SECOND, ONE_MINUTE, ONE_HOUR]}>
          <LocalAccuracyRenderer />
        </DurationsContext.Provider>
      </GlobalAccuracyContext.Provider>
    ));

    LocalAccuracyTester.displayName = 'LocalAccuracyTester';

    return LocalAccuracyTester;
  };

  it('returns an accuracy map with the correct values', () => {
    const LocalAccuracyTester = generateLocalAccuracyTester();
    const wrapper = mount(<LocalAccuracyTester />);

    const second = wrapper.find(SecondAccuracyEntry);
    expect(second.find(Difference).prop('children')).toBe(ONE_SECOND.value);
    expect(second.find(MaximumAccuracy).prop('children')).toBe(ONE_SECOND.value);
    expect(second.find(MinimumAccuracy).prop('children')).toBe(ONE_SECOND.value);
    expect(second.find(PreferredAccuracy).prop('children')).toBe(ONE_SECOND.value);

    const minute = wrapper.find(MinuteAccuracyEntry);
    expect(minute.find(Difference).prop('children')).toBe(ONE_MINUTE.value);
    expect(minute.find(MaximumAccuracy).prop('children')).toBe(ONE_SECOND.value);
    expect(minute.find(MinimumAccuracy).prop('children')).toBe(ONE_SECOND.value);
    expect(minute.find(PreferredAccuracy).prop('children')).toBe(ONE_SECOND.value);

    const hour = wrapper.find(HourAccuracyEntry);
    expect(hour.find(Difference).prop('children')).toBe(ONE_HOUR.value);
    expect(hour.find(MaximumAccuracy).prop('children')).toBe(ONE_SECOND.value);
    expect(hour.find(MinimumAccuracy).prop('children')).toBe(ONE_HOUR.value);
    expect(hour.find(PreferredAccuracy).prop('children')).toBe(ONE_MINUTE.value);
  });
});
