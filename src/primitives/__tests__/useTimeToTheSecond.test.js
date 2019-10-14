import React from 'react';
import { mount } from 'enzyme';

import useTimeToTheSecond from '../useTimeToTheSecond';
import { ONE_SECOND } from '../../durations';

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
      <ONE_SECOND.context.Provider value={generateTimeContextValue({ time: mockTime })}>
        <TesterComponent />
      </ONE_SECOND.context.Provider>
    );

    const testerComponent = wrapper.find(TesterComponent);
    expect(testerComponent).toHaveLength(1);
    expect(testerComponent.text()).toEqual(String(mockTime));
  });

  it("correctly invokes the context's registerConsumer function", () => {
    const TesterComponent = generateTesterComponent();
    const mockRegisterConsumer = jest.fn();

    mount(
      <ONE_SECOND.context.Provider
        value={generateTimeContextValue({ registerConsumer: mockRegisterConsumer })}
      >
        <TesterComponent />
      </ONE_SECOND.context.Provider>
    );
    expect(mockRegisterConsumer).toHaveBeenCalledTimes(1);
  });

  it("correctly invokes the context's unregisterConsumer function when unmounting", () => {
    const TesterComponent = generateTesterComponent();
    const mockUnregisterConsumer = jest.fn();

    const wrapper = mount(
      <ONE_SECOND.context.Provider
        value={generateTimeContextValue({ unregisterConsumer: mockUnregisterConsumer })}
      >
        <TesterComponent />
      </ONE_SECOND.context.Provider>
    );
    expect(mockUnregisterConsumer).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(mockUnregisterConsumer).toHaveBeenCalledTimes(1);
  });
});
