const dateFns = require('date-fns');

module.exports = {
  siteMetadata: {
    version: require('./package.json').version,
    commit: process.env.COMMIT_REF || 'dev',
    timestamp: dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-netlify`,
    'gatsby-plugin-offline',
  ],
};
