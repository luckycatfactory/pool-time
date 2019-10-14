import React from 'react';
import { mount } from 'enzyme';

import useInterval from '../useInterval';

jest.useFakeTimers();

describe('useInterval()', () => {
  const generateTesterComponent = () => {
    const TesterComponent = ({ callback, period }) => {
      useInterval(callback, period);

      return 'TesterComponent';
    };

    return TesterComponent;
  };

  it('does not initially call the callback', () => {
    const TesterComponent = generateTesterComponent();
    const mockCallback = jest.fn();
    mount(<TesterComponent callback={mockCallback} period={1000} />);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('does not call a callback if there is no period', () => {
    const TesterComponent = generateTesterComponent();
    const mockCallback = jest.fn();
    mount(<TesterComponent callback={mockCallback} period={null} />);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('calls the callback exactly when it should', () => {
    const TesterComponent = generateTesterComponent();
    const mockCallback = jest.fn();
    mount(<TesterComponent callback={mockCallback} period={1000} />);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(999);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('calls the callback exactly when it should multiple times', () => {
    const TesterComponent = generateTesterComponent();
    const mockCallback = jest.fn();
    mount(<TesterComponent callback={mockCallback} period={1000} />);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(999);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(999);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it('correctly updates the callback without altering the scheduling when the callback changes', () => {
    const TesterComponent = generateTesterComponent();
    const firstMockCallback = jest.fn();
    const wrapper = mount(<TesterComponent callback={firstMockCallback} period={1000} />);
    jest.advanceTimersByTime(999);
    const secondMockCallback = jest.fn();
    wrapper.setProps({ callback: secondMockCallback });
    expect(secondMockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(secondMockCallback).toHaveBeenCalledTimes(1);
  });

  it('immediately changes the scheduling if a new period is provided', () => {
    const TesterComponent = generateTesterComponent();
    const mockCallback = jest.fn();
    const wrapper = mount(<TesterComponent callback={mockCallback} period={1000} />);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(999);
    expect(mockCallback).not.toHaveBeenCalled();
    wrapper.setProps({ period: 2000 });
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1998);
    expect(mockCallback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
