/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { ReactTestRenderer as TestRenderer } from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-sound-level', () => ({
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  onNewFrame: jest.fn(),
}));

jest.mock('react-native-sound', () => {
  const Sound = jest.fn().mockImplementation(() => ({
    isLoaded: jest.fn(() => true),
    play: jest.fn(),
    release: jest.fn(),
    setCurrentTime: jest.fn(),
    stop: jest.fn((callback?: () => void) => callback?.()),
  })) as jest.Mock & { setCategory: jest.Mock };

  Sound.setCategory = jest.fn();

  return Sound;
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('renders correctly', async () => {
  let renderer: TestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
