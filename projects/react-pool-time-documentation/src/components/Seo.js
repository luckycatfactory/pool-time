/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

const query = graphql`
  query {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`;

const SEO = React.memo(({ description, lang, meta, title }) => {
  const { site } = useStaticQuery(query);
  const metaDescription = useMemo(() => description || site.siteMetadata.description, [
    description,
    site,
  ]);
  const computedMeta = useMemo(
    () =>
      [
        {
          content: metaDescription,
          name: `description`,
        },
        {
          content: title,
          property: `og:title`,
        },
        {
          content: metaDescription,
          property: `og:description`,
        },
        {
          content: `website`,
          property: `og:type`,
        },
        {
          content: `summary`,
          name: `twitter:card`,
        },
        {
          content: site.siteMetadata.author,
          name: `twitter:creator`,
        },
        {
          content: title,
          name: `twitter:title`,
        },
        {
          content: metaDescription,
          name: `twitter:description`,
        },
      ].concat(meta),
    [meta, site, metaDescription, title]
  );

  const titleTemplate = useMemo(() => `%s | ${site.siteMetadata.title}`, [site]);
  const htmlAttributes = useMemo(
    () => ({
      lang,
    }),
    [lang]
  );

  return (
    <Helmet
      htmlAttributes={htmlAttributes}
      title={title}
      titleTemplate={titleTemplate}
      meta={computedMeta}
    />
  );
});

SEO.displayName = 'SEO';

SEO.defaultProps = {
  description: ``,
  lang: `en`,
  meta: [],
};

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
};

export default SEO;
