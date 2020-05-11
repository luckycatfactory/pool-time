import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

interface HeaderProps {
  readonly contentMaxWidth: number;
  readonly siteTitle: string;
}

const HeaderElement = styled.header`
  box-shadow: 0 3px 8px 0 rgba(116, 129, 141, 0.08);
  border-bottom: 1px solid #d4dadf;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 auto;
  max-width: ${({ maxWidth }): string => `${maxWidth}px`};
  padding: 1.45rem 1.0875rem;
`;

const TitleArea = styled.div`
  align-items: center;
  border-right: 1px solid #d4dadf;
  display: flex;
  justify-content: flex-start;
  width: 240px;
`;

const NavigationArea = styled.nav`
  flex: 1;
`;

const StyledLink = styled(Link)`
  color: black;
  font-weight: 900;
  text-decoration: none;
`;

const HeaderNavigationLink = styled(Link)`
  color: #3884ff;
  font-size: 18px;
  margin-left: 48px;
  text-decoration: none;
`;

const Header = React.memo(({ contentMaxWidth, siteTitle }: HeaderProps) => (
  <HeaderElement>
    <CenteredContainer maxWidth={contentMaxWidth}>
      <TitleArea>
        <StyledLink to="/">{siteTitle}</StyledLink>
      </TitleArea>
      <NavigationArea>
        <HeaderNavigationLink to="/">About</HeaderNavigationLink>
        <HeaderNavigationLink to="/">GitHub</HeaderNavigationLink>
      </NavigationArea>
    </CenteredContainer>
  </HeaderElement>
));

Header.displayName = 'Header';

export default Header;
