import React from 'react';
import {
  Code,
  OrderedList,
  Paragraph,
  LG,
  XL,
  XXL,
} from '@zendeskgarden/react-typography';

import CodeBlock from '../components/CodeBlock';
import Section from '../components/Section';

const initializeCodeString = `
import {
  createPoolTimeProvider,
  useRelativeTime
} from '@react-pool-time/react-pool-time';

// Step One: Create your configuration.
const configuration = {};

// Step Two: Initialize react-pool-time with your configuration.
const PoolTimeProvider = createPoolTimeProvider(configuration);

export default PoolTimeProvider;
`;

const usageCodeString = `
import React from 'react';
import { useRelativeTime } from '@react-pool-time/react-pool-time';

import PoolTimeProvider from './PoolTimeProvider';

const RelativeTime = React.memo(({ time }) => {
  const relativeTime = useRelativeTime(time);

  return (
    <div>
      {relativeTime}ms ago!
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
`;

const Installation = React.memo(() => (
  <>
    <XXL>Installation</XXL>
    <Section>
      <XL>Install the Package</XL>
      <Paragraph>
        To install <Code>react-pool-time</Code>, run one of the following:
      </Paragraph>
      <LG>Yarn</LG>
      <CodeBlock language={'bash'}>
        {'yarn add @react-pool-time/react-pool-time'}
      </CodeBlock>
      <LG>NPM</LG>
      <CodeBlock language={'bash'}>
        {'npm install @react-pool-time/react-pool-time --save'}
      </CodeBlock>
    </Section>
    <Section>
      <XL>Initialization</XL>
      <Paragraph>Then, you will need to do two things:</Paragraph>
      <OrderedList size="large">
        <OrderedList.Item>Create your configuration</OrderedList.Item>
        <OrderedList.Item>Initialize react-pool-time</OrderedList.Item>
      </OrderedList>
      <CodeBlock>{initializeCodeString}</CodeBlock>
    </Section>
    <Section>
      <XL>Usage</XL>
      <Paragraph>Then you are ready to use them.</Paragraph>
      <CodeBlock>{usageCodeString}</CodeBlock>
    </Section>
  </>
));

Installation.displayName = 'Installation';

export default Installation;
