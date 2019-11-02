import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { graphql, Link, useStaticQuery } from 'gatsby';
import styled from 'styled-components';

const Container = styled.div`
  border-right: 1px solid grey;
  display: flex;
  flex-direction: column;
  padding: 12px 12px;
  font-size: 14px;
  width: 200px;
`;

const apiEntriesQuery = graphql`
  {
    apiEntries: allFile(filter: { sourceInstanceName: { eq: "api" } }) {
      edges {
        node {
          name
          relativePath
        }
      }
    }
    guideEntries: allFile(filter: { sourceInstanceName: { eq: "guides" } }) {
      edges {
        node {
          name
          relativePath
        }
      }
    }
  }
`;

const NavigationLink = styled(Link)`
  display: block;
  padding: 8px;
  text-decoration: none;
  :visited {
    color: inherit;
  }
`;

const Sidebar = React.memo(({ title }) => {
  const { apiEntries, guideEntries } = useStaticQuery(apiEntriesQuery);

  const apiRoutes = useMemo(() => apiEntries.edges.map(edge => edge.node), [apiEntries.edges]);
  const guideRoutes = useMemo(() => guideEntries.edges.map(edge => edge.node), [guideEntries.edges]);

  return (
    <Container>
      <h1>{title}</h1>
      <h2>Guides</h2>
      {guideRoutes.map(route => (
        <NavigationLink activeClassName="active" key={route.name} to={`/guides/${route.name}`}>
          {route.name}
        </NavigationLink>
      ))}
      <h2>Api</h2>
      {apiRoutes.map(route => (
        <NavigationLink activeClassName="active" key={route.name} to={`/api/${route.name}`}>
          <code>{route.name}</code>
        </NavigationLink>
      ))}
    </Container>
  );
});

Sidebar.propTypes = {
  title: PropTypes.string.isRequired,
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
