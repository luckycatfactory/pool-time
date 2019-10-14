import React from 'react';
import { mount } from 'enzyme';

import useTimeToTheHour from '../useTimeToTheHour';
import { ONE_HOUR } from '../../durations';

describe('useTimeToTheHour()', () => {
  const generateTimeContextValue = (overrides = {}) => ({
    registerConsumer: () => {},
    time: Date.now(),
    unregisterConsumer: () => {},
    ...overrides,
  });
  const generateTesterComponent = () => {
    const TesterComponent = () => {
      const time = useTimeToTheHour();

      return String(time);
    };

    return TesterComponent;
  };

  it('returns the correct value', () => {
    const TesterComponent = generateTesterComponent();
    const mockTime = Date.now();

    const wrapper = mount(
      <ONE_HOUR.context.Provider value={generateTimeContextValue({ time: mockTime })}>
        <TesterComponent />
      </ONE_HOUR.context.Provider>
    );

    const testerComponent = wrapper.find(TesterComponent);
    expect(testerComponent).toHaveLength(1);
    expect(testerComponent.text()).toEqual(String(mockTime));
  });

  it("correctly invokes the context's registerConsumer function", () => {
    const TesterComponent = generateTesterComponent();
    const mockRegisterConsumer = jest.fn();

    mount(
      <ONE_HOUR.context.Provider
        value={generateTimeContextValue({ registerConsumer: mockRegisterConsumer })}
      >
        <TesterComponent />
      </ONE_HOUR.context.Provider>
    );
    expect(mockRegisterConsumer).toHaveBeenCalledTimes(1);
  });

  it("correctly invokes the context's unregisterConsumer function when unmounting", () => {
    const TesterComponent = generateTesterComponent();
    const mockUnregisterConsumer = jest.fn();

    const wrapper = mount(
      <ONE_HOUR.context.Provider
        value={generateTimeContextValue({ unregisterConsumer: mockUnregisterConsumer })}
      >
        <TesterComponent />
      </ONE_HOUR.context.Provider>
    );
    expect(mockUnregisterConsumer).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(mockUnregisterConsumer).toHaveBeenCalledTimes(1);
  });
});
