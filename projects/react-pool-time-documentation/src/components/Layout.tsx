import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';
import { ThemeProvider } from '@zendeskgarden/react-theming';

import GlobalStyle from './GlobalStyle';
import Header from './Header';
import Main from './Main';

interface LayoutProps {
  children: React.ReactNode;
}

const CONTENT_MAX_WIDTH = 960;

const GlobalLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Layout = React.memo(({ children }: LayoutProps) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <ThemeProvider>
      <GlobalLayoutContainer>
        <GlobalStyle />
        <Header
          contentMaxWidth={CONTENT_MAX_WIDTH}
          siteTitle={data.site.siteMetadata.title}
        />
        <Main contentMaxWidth={CONTENT_MAX_WIDTH}>{children}</Main>
      </GlobalLayoutContainer>
    </ThemeProvider>
  );
});

Layout.displayName = 'Layout';

export default Layout;
