# React Pool Time

React Pool Time allows you to delegate all live-updating times to a single, global `setInterval`, providing you the ability to strike the balance between performance and accuracy that's appropriate for your React application.

## Motivation

Using `setInterval` on a component-by-component basis is inherently expensive.
It also is a common area for developers to accidentally introduce memory leaks by failing to `clearInterval`.

## Getting Started

TBD

## Basic Usage

The general use of this package takes the form of:

```jsx
import React from 'react';
import { TimeProviders, useRelativeTime } from 'react-pool-time';

const someTimeFormatter = inputTime => {
  // You can use whatever you'd like here!
  return `${inputTime}ms`;
}

const SomeComponent = React.memo(({ createdAt }) => {
  const timeSinceCreation = useRelativeTime(
    createdAt,
    { timeFormatter: someTimeFormatter }
  );

  return (
    <div>
      {/* ... */}
      <div>Created {timeSinceCreation} ago</div>
    </div>
  );
});

const App = React.memo(() => {
  const someThings = [{ /* createdAt: 1570303707380, ... */ }];

  return (
    <TimeProviders>
      {someThings.map(({ createdAt }) => <SomeComponent createdAt={createdAt} />)}
    </TimeProviders>
  );
);
```
