module.exports = {
  pathPrefix: '/react-pool-time',
  plugins: [
    `gatsby-plugin-react-helmet`,
    'gatsby-plugin-styled-components',
    {
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    {
      options: {
        name: 'api',
        path: `${__dirname}/src/pages/api`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    {
      options: {
        name: 'guides',
        path: `${__dirname}/src/pages/guides`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    {
      options: {
        ignore: ['**/index.js', '**/__tests__/**'],
        name: 'durations',
        path: `${__dirname}/../react-pool-time/src/durations`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    {
      options: {
        ignore: ['**/snippets/**'],
        name: 'examples',
        path: `${__dirname}/src/pages/examples`,
      },
      resolve: `gatsby-source-filesystem`,
    },
    {
      options: {
        alias: {},
        extensions: [],
      },
      resolve: `gatsby-plugin-alias-imports`,
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    'gatsby-plugin-layout',
    {
      options: {
        background_color: `#663399`,
        display: `minimal-ui`,
        // icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
        name: `React Pool Time`,
        short_name: `React Pool Time`,
        start_url: `/`,
        theme_color: `#663399`,
      },
      resolve: `gatsby-plugin-manifest`,
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
  siteMetadata: {
    author: `@gatsbyjs`,
    description: `The website for react-pool-time.`,
    title: `React Pool Time`,
  },
};
