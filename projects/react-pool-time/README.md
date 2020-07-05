[![codecov](https://codecov.io/gh/louisscruz/react-pool-time/branch/master/graph/badge.svg?token=YlOca0sPpR)](https://codecov.io/gh/louisscruz/react-pool-time)
[![npm version](https://badge.fury.io/js/%40luckycatfactory%2Freact-pool-time.svg)](https://badge.fury.io/js/%40luckycatfactory%2Freact-pool-time)

# `react-pool-time`

This is the React implementation of Pool Time.

## Installation

### `npm`

```sh
npm install @luckycatfactory/pool-time-core @luckycatfactory/react-pool-time --save
```

### `yarn`

```sh
yarn add @luckycatfactory/pool-time-core @luckycatfactory/react-pool-time
```

## Usage

### Initialize the Provider

```jsx
import PoolTime from '@luckycatfactory/pool-time-core';
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
} from '@luckycatfactory/react-pool-time';

// Step One: Initialize a PoolTime instance with your configuration.
const poolTime = new PoolTime({
  configuration: {
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
  }
});

// Step Two: Initialize react-pool-time with your configuration.
const PoolTimeProvider = createPoolTimeProvider(configuration);

export default PoolTimeProvider;
```

### Use the useRelativeTime Hook

```jsx
import React from 'react';
import { useRelativeTime } from '@luckycatfactory/react-pool-time';

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