# Pool Time

A declarative relative time management system meant to make applications more performant, accurate, and intentional in their time updates.
It delegates all time updates to a single `setInterval` that dynamically and intelligently adjusts to an optimal interval duration across all consumers of the time data.
Consumers of the time data only render when needed to maintain compliance with the specified accuracy configuration specified at the top of the application.

## Motivation

The traditional approach to relative time rendering in JavaScript is less than ideal on a few fronts.
Common practice for relative time in JavaScript applications is generally lacking.
There are at least three things that can be done to improve how developers deal with relative time.

### All Time Updates Should Be Delegated to a Single `setInterval`

**reasons:** Performance, Cross-Component Accuracy

Naïve implementations of relative time will spin off an interval per component.
This means that the cardinality of intervals is linear to the number of relative time components.
That can affect a given application's performance, especially when the number of components to render can be very large.
Also, this approach can produce momentary inconsistencies across all components, since there's no guarantee that every component's interval was scheduled at the same time, and intervals can skew over time.

This package addresses this issue through delegating all registered consumers of time to a single `setInterval` in a top-level provider.

### Time Accuracy for Relative Time Updates Should Be Declarative and Intentional

**reasons:** Performance, Accuracy

In naïve implementations, a component displaying relative time will eventually switch from presenting time in one unit of measurement to another.
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

### Cleanup Should Happen By Default

**reasons:** Performance

If a `setInterval` is created that references a given component instance, but that component is unmounted, it will continue to evade garbage collection unless the interval ceases to exist via a `clearInterval`.
Failure to clear the interval results in a memory leak.

This package dodges that problem entirely through the delegated interval in the top-level provider.
If no consumers are rendered underneath the top-level provider, the top-level provider automatically `clearInterval`s the delegated interval and only recreates a new one when consumers become rendered underneath it.

## Implementations

* [pool-time-core](https://github.com/luckycatfactory/pool-time/tree/master/projects/pool-time-core): vanilla JS core used by all framework-specific implementations
* [react-pool-time](https://github.com/luckycatfactory/pool-time/tree/master/projects/react-pool-time): React implementation via context and hooks
* TBD: we hope to get to adding more implementations

It's worth mentioning that the API is designed such that it's even possible to share a `PoolTime` core instance across any number of framework-specific implementations.
This means that if you have some kind of "micro-frontend" application, you can ensure that you're still getting all the benefits above without incurring any potential performance overhead.
