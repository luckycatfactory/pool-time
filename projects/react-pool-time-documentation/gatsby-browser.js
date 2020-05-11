import React from 'react';
import Layout from './src/components/Layout';

// Unfortunately, we can't use the gatsby-plugin-layout plugin, as it does not
// know how to handle TypeScript.
/* eslint-disable */
export const wrapPageElement = ({ element, props }) => (
  <Layout {...props}>{element}</Layout>
);
/* eslint-enable */
