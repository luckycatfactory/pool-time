[![codecov](https://codecov.io/gh/louisscruz/react-pool-time/branch/master/graph/badge.svg?token=YlOca0sPpR)](https://codecov.io/gh/louisscruz/react-pool-time)

# `pool-time`

A configurable and performant time manager.

## Installation

### `npm`

```sh
npm install @pool-time/react-pool-time --save
```

### `yarn`

```sh
yarn add @pool-time/react-pool-time
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