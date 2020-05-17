/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

const configuration = {
  siteMetadata: {
    title: 'react-pool-time',
    description: 'This is the website for the react-pool-time package.',
    author: '@react-pool-time',
  },
  plugins: [
    'gatsby-plugin-typescript',
    {
      resolve: 'gatsby-plugin-styled-components',
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'react-pool-time',
        short_name: 'react-pool-time', //eslint-disable-line @typescript-eslint/camelcase
        start_url: '/', //eslint-disable-line @typescript-eslint/camelcase
        background_color: '#663399', //eslint-disable-line @typescript-eslint/camelcase
        theme_color: '#663399', //eslint-disable-line @typescript-eslint/camelcase
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-plugin-alias-imports',
      options: {
        alias: {
          '@react-pool-time/react-pool-time': path.resolve(
            __dirname,
            '../react-pool-time/src'
          ),
        },
        extensions: ['ts'],
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};

module.exports = configuration;
