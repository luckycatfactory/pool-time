import React from 'react';
import { mount } from 'enzyme';

import useTimeToTheSecond from '../useTimeToTheSecond';
import SecondContext from '../TimeProviders/SecondContext';

describe('useTimeToTheSecond()', () => {
  const generateTimeContextValue = (overrides = {}) => ({
    registerConsumer: () => {},
    time: Date.now(),
    unregisterConsumer: () => {},
    ...overrides,
  });
  const generateTesterComponent = () => {
    const TesterComponent = () => {
      const time = useTimeToTheSecond();

      return String(time);
    };

    return TesterComponent;
  };

  it('returns the correct value', () => {
    const TesterComponent = generateTesterComponent();
    const mockTime = Date.now();

    const wrapper = mount(
      <SecondContext.Provider value={generateTimeContextValue({ time: mockTime })}>
        <TesterComponent />
      </SecondContext.Provider>
    );

    const testerComponent = wrapper.find(TesterComponent);
    expect(testerComponent).toHaveLength(1);
    expect(testerComponent.text()).toEqual(String(mockTime));
  });

  it("correctly invokes the context's registerConsumer function", () => {
    const TesterComponent = generateTesterComponent();
    const mockRegisterConsumer = jest.fn();

    mount(
      <SecondContext.Provider
        value={generateTimeContextValue({ registerConsumer: mockRegisterConsumer })}
      >
        <TesterComponent />
      </SecondContext.Provider>
    );
    expect(mockRegisterConsumer).toHaveBeenCalledTimes(1);
  });

  it("correctly invokes the context's unregisterConsumer function when unmounting", () => {
    const TesterComponent = generateTesterComponent();
    const mockUnregisterConsumer = jest.fn();

    const wrapper = mount(
      <SecondContext.Provider
        value={generateTimeContextValue({ unregisterConsumer: mockUnregisterConsumer })}
      >
        <TesterComponent />
      </SecondContext.Provider>
    );
    expect(mockUnregisterConsumer).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(mockUnregisterConsumer).toHaveBeenCalledTimes(1);
  });
});
