import React from 'react';
import { shallow } from 'enzyme';

import generateTimeProviders from '../generateTimeProviders';
import * as durations from '../../durations';
import DurationsContext from '../DurationsContext';
import GlobalAccuracyContext from '../GlobalAccuracyContext';

describe('generateTimeProviders()', () => {
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

  describe('component hierarchy', () => {
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
});
