import React from 'react';
import { mount } from 'enzyme';

import generateTimeContextConsumptionHook from '../generateTimeContextConsumptionHook';

describe('generateTimeContextConsumptionHook()', () => {
  const generateTimeContextValue = (overrides = {}) => ({
    registerConsumer: () => {},
    time: Date.now(),
    unregisterConsumer: () => {},
    ...overrides,
  });
  const generateTimeContext = () => React.createContext();
  const generateTesterComponent = (useTimeContextHook, timeFormatter) => {
    const TesterComponent = () => {
      const time = useTimeContextHook(timeFormatter);

      return time;
    };

    return TesterComponent;
  };

  it('returns a hook that properly consumes context to return the correct time', () => {
    const mockTime = Date.now();
    const TimeContext = generateTimeContext();
    const timeContextConsumptionHook = generateTimeContextConsumptionHook(TimeContext);
    const TesterComponent = generateTesterComponent(timeContextConsumptionHook);

    const wrapper = mount(
      <TimeContext.Provider value={generateTimeContextValue({ time: mockTime })}>
        <TesterComponent />
      </TimeContext.Provider>
    );

    const testerComponent = wrapper.find(TesterComponent);
    expect(testerComponent).toHaveLength(1);
    expect(testerComponent.text()).toBe(String(mockTime));
  });

  it('returns a hook that properly consumes context to return the correct time with a formatter when one is provided', () => {
    const mockTime = Date.now();
    const TimeContext = generateTimeContext();
    const timeContextConsumptionHook = generateTimeContextConsumptionHook(TimeContext);
    const TesterComponent = generateTesterComponent(
      timeContextConsumptionHook,
      inputTime => `${inputTime}ms`
    );

    const wrapper = mount(
      <TimeContext.Provider value={generateTimeContextValue({ time: mockTime })}>
        <TesterComponent />
      </TimeContext.Provider>
    );

    const testerComponent = wrapper.find(TesterComponent);
    expect(testerComponent).toHaveLength(1);
    expect(testerComponent.text()).toBe(`${mockTime}ms`);
  });

  it('returns a hook that properly invokes the registerConsumer function when mounted', () => {
    const TimeContext = generateTimeContext();
    const timeContextConsumptionHook = generateTimeContextConsumptionHook(TimeContext);
    const TesterComponent = generateTesterComponent(
      timeContextConsumptionHook,
      inputTime => `${inputTime}ms`
    );
    const mockRegisterConsumer = jest.fn();

    mount(
      <TimeContext.Provider
        value={generateTimeContextValue({ registerConsumer: mockRegisterConsumer })}
      >
        <TesterComponent />
      </TimeContext.Provider>
    );

    expect(mockRegisterConsumer).toHaveBeenCalledTimes(1);
  });

  it('returns a hook that properly invokes the unregisterConsumer function when unmounted', () => {
    const TimeContext = generateTimeContext();
    const timeContextConsumptionHook = generateTimeContextConsumptionHook(TimeContext);
    const TesterComponent = generateTesterComponent(
      timeContextConsumptionHook,
      inputTime => `${inputTime}ms`
    );
    const mockUnregisterConsumer = jest.fn();

    const wrapper = mount(
      <TimeContext.Provider
        value={generateTimeContextValue({ unregisterConsumer: mockUnregisterConsumer })}
      >
        <TesterComponent />
      </TimeContext.Provider>
    );

    expect(mockUnregisterConsumer).not.toHaveBeenCalled();

    wrapper.unmount();

    expect(mockUnregisterConsumer).toHaveBeenCalledTimes(1);
  });
});
