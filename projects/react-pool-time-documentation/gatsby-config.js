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
        // icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};

module.exports = configuration;
