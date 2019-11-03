import React from 'react';

import SEO from '../components/Seo';
import CodeBox from '../components/CodeBox';

const string = `
const IndexPage = React.memo(() => (
  <>
    <SEO title="Home" />
    <h2>About</h2>
    <p>
      This package provides a performant and configurable way of pooling timed updates in React.
    </p>
    <h2>Getting Started</h2>
    <p>This is how you get started...</p>
    <CodeBox language="bash">yarn add react-pool-time</CodeBox>
    <CodeBox language="bash">npm install --save react-pool-time</CodeBox>
    <CodeBox>{string}</CodeBox>
  </>
));
`;

const IndexPage = React.memo(() => (
  <>
    <SEO title="Home" />
    <h2>About</h2>
    <p>
      This package provides a performant and configurable way of pooling timed updates in React.
    </p>
    <h2>Getting Started</h2>
    <p>This is how you get started...</p>
    <CodeBox language="bash">yarn add react-pool-time</CodeBox>
    <CodeBox language="bash">npm install --save react-pool-time</CodeBox>
    <CodeBox>{string}</CodeBox>
  </>
));

IndexPage.displayName = 'IndexPage';

export default IndexPage;
