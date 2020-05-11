import React from 'react';

const Motivation = React.memo(() => (
  <div>
    <h1>Motivation</h1>
    <h2>Accuracy</h2>
    <p>
      When people set a timer for a given time, they&apos;re prone to set a
      timer for the time they&apos;re trying to measure.
    </p>
    <h2>Performance</h2>
    <p>
      Having a bunch of timers is not great. Also, people tend to set all timers
      to the least common denominator.
    </p>
    <p>
      Performance of a given application should be improved through two means:
    </p>
    <h3>Timer Delegation</h3>
    <p>Delegating to a single timer makes applications more snappy.</p>
    <h3>As-Needed Accuracy</h3>
    <p>An API can encourage applications to minimize their timer frequency.</p>
  </div>
));

Motivation.displayName = 'Motivation';

export default Motivation;
