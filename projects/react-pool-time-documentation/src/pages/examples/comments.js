import React from 'react';
import { generateTimeProviders, ONE_SECOND, FIVE_SECONDS, ONE_MINUTE } from 'react-pool-time';

const TimeProviders = generateTimeProviders(
  [ONE_SECOND, FIVE_SECONDS, ONE_MINUTE],
  [
    {
      difference: ONE_SECOND,
      maximumAccuracy: ONE_SECOND,
      minimumAccuracy: ONE_SECOND,
      preferredAccuracy: ONE_SECOND,
    },
  ]
);

const Comments = React.memo(() => {
  return (
    <TimeProviders>
      <h2>Comments Example</h2>
    </TimeProviders>
  );
});

Comments.displayName = 'Comments';

export default Comments;
