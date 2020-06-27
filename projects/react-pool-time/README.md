[![codecov](https://codecov.io/gh/louisscruz/react-pool-time/branch/master/graph/badge.svg?token=YlOca0sPpR)](https://codecov.io/gh/louisscruz/react-pool-time)

# `react-pool-time`

A configurable and performant time manager.
It delegates all time updates to a single `setInterval` that dynamically and intelligently adjusts to an optimal interval duration across all consumers of the time data.
Consumers of the time data only render when needed to maintain compliance with the specified accuracy configuration specified at the top of the application.

## Motivation

The traditional approach to relative time rendering in JavaScript is less than ideal on a few fronts.
Common practice looks something like this.

### Aspect One: Each Component Spins off Its Own `setInterval`

**Issues:** Performance, Cross-Component Accuracy

Taking this approach, the cardinality of intervals is linear to the number of components.
That can affect a given application's performance, especially when the number of components to render can be very large.
Also, this approach can produce momentary inconsistencies across all components, since there's no guarantee that every component's interval was scheduled at the same time, and intervals can skew over time.

This package addresses this issue through delegating all registered consumers of time to a single `setInterval` in a top-level provider.

### Aspect Two: Set a Blanket 1000ms Interval

**Issues:** Performance, Accuracy

Most of the time, a component displaying relative time will eventually switch from presenting time in one unit of measurement to another.
For instance, it's not likely that one would intend to show a user `14400000 milliseconds ago` – most interfaces will opt for `4 hours ago`.
If we know that the time ago will only need to change once within the next hour, why would we opt to fire off our interval callback 3600 = (60 * 60) times for every component that's at the `hour` unit of time?
The usual reason is _accuracy_, but that isn't even handled very well by setting a blanket interval.
If a one second interval is used, that means that relative time calculations can at-worst be off by one second.
Also, it's unlikely that users would notice a one second inaccuracy at larger units of time.
Does a time of `about 4 years ago` really need to-the-second accuracy?
At the very least we should have a mechanism for controlling the accuracy at various scales of relative time, and that's not offered in a blanket interval.

This package addresses this issue through configuration that's passed to the top-level provider.
Accuracies are specified through entries (i.e. `{ upTo: ONE_MINUTE, within: ONE_SECOND }`).
For any time difference that lies in a certain `upTo`, the time will be updated within the `within` duration.
The delegated `setInterval` is optimized such that it will only operate at the least common `within` duration value for the time consumers rendered underneath it.

### Aspect Three: Components Need to Clean Up Their Intervals on Unmount

**Issues:** Performance

If a `setInterval` is created that references a given component instance, but that component is unmounted, it will continue to evade garbage collection unless the interval ceases to exist via a `clearInterval`.
Failure to clear the interval results in a memory leak.

This package dodges that problem entirely through the delegated interval in the top-level provider.
If no consumers are rendered underneath the top-level provider, the top-level provider automatically `clearInterval`s the delegated interval and only recreates a new one when consumers become rendered underneath it.

## Installation

### `npm`

```sh
npm install @pool-time/pool-time-core @pool-time/react-pool-time --save
```

### `yarn`

```sh
yarn add @pool-time/pool-time-core @pool-time/react-pool-time
```

## Usage

### Initialize the Provider

```jsx
import {
  createPoolTimeProvider,
  useRelativeTime,
  ONE_SECOND,
  FIVE_SECONDS,
  TEN_SECONDS,
  THIRTY_SECONDS,
  ONE_MINUTE,
  FIVE_MINUTES,
  ETERNITY
} from '@pool-time/react-pool-time';

// Step One: Create your configuration.
const configuration = {
  accuracies: [
    {
      upTo: FIVE_SECONDS,
      within: ONE_SECOND,
    },
    {
      upTo: THIRTY_SECONDS,
      within: FIVE_SECONDS,
    },
    {
      upTo: ONE_MINUTE,
      within: TEN_SECONDS,
    },
    {
      upTo: FIVE_MINUTES,
      within: THIRTY_SECONDS,
    },
    {
      upTo: ETERNITY,
      within: ONE_MINUTE,
    },
  ]
};

// Step Two: Initialize react-pool-time with your configuration.
const PoolTimeProvider = createPoolTimeProvider(configuration);

export default PoolTimeProvider;
```

### Use the useRelativeTime Hook

```jsx
import React from 'react';
import { useRelativeTime } from '@pool-time/react-pool-time';

import PoolTimeProvider from './PoolTimeProvider';

const RelativeTime = React.memo(({ time }) => {
  const {
    /* difference, // If you'd prefer to get the raw difference, use this. */
    /* time, // If you just need the time, use this. */
    getRoundedDifference
  } = useRelativeTime(time);

  const timeAgo = useMemo(() => {
    const elapsedTime = getRoundedDifference();
    return `${elapsedTime}ms ago`;
  }, [getRoundedDifference]);

  return (
    <div>
      {timeAgo}
    </div>
  );
});

const now = Date.now();

const times = [
  now - 1000,
  now - 2000,
  now - 3000,
  now - 5000,
];

const App = React.memo(() => (
  <PoolTimeProvider>
    {times.map(time => <RelativeTime key={time} time={time} />)}
  </PoolTimeProvider>
));

export default App;
```