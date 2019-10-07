import React, { useContext, useEffect } from 'react';
import { mount } from 'enzyme';

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
  });

  it('passes the correct scale and time to each time renderer', () => {
    const mockNow = Date.now();
    getDateNow.mockImplementation(() => mockNow);
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
      expect(time.props()).toEqual({ children: mockNow });
    });
  });
});
