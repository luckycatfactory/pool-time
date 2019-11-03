/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import { Reset } from 'styled-reset';

import GlobalStyle from './GlobalStyle';
import Sidebar from './Sidebar';

const query = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const Main = styled.main`
  flex: 1;
  overflow-y: scroll;
  padding: 24px;
`;

const Layout = ({ children }) => {
  const data = useStaticQuery(query);

  return (
    <Container>
      <Reset />
      <GlobalStyle />
      <Sidebar title={data.site.siteMetadata.title} />
      <Main>{children}</Main>
    </Container>
  );
};

Layout.displayName = 'Layout';

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
