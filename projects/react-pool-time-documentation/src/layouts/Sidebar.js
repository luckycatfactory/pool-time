import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { graphql, Link, useStaticQuery } from 'gatsby';
import styled from 'styled-components';

const Container = styled.div`
  border-right: 1px solid grey;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  overflow-y: scroll;
  padding: 12px 12px;
  width: 186px;
`;

const NavigationSection = styled.section`
  padding: 8px 0px;
`;

const NavigationLink = styled(Link)`
  color: #cc445c !important;
  display: block;
  padding: 8px;
  text-decoration: none;
  :visited {
    color: inherit;
  }
`;

const toUpperCase = string => `${string[0].toUpperCase()}${string.slice(1)}`;

const getDisplayName = name => {
  const words = name.split('-');
  const upperCaseWords = words.map(toUpperCase);
  return upperCaseWords.join(' ');
};

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
    exampleEntries: allFile(filter: { sourceInstanceName: { eq: "examples" } }) {
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

const Sidebar = React.memo(({ title }) => {
  const { apiEntries, exampleEntries, guideEntries } = useStaticQuery(apiEntriesQuery);

  const apiRoutes = useMemo(() => apiEntries.edges.map(edge => edge.node), [apiEntries.edges]);
  const exampleRoutes = useMemo(
    () =>
      exampleEntries.edges.map(edge => ({
        ...edge.node,
        displayName: getDisplayName(edge.node.name),
      })),
    [exampleEntries.edges]
  );
  const guideRoutes = useMemo(
    () =>
      guideEntries.edges.map(edge => ({
        ...edge.node,
        displayName: getDisplayName(edge.node.name),
      })),
    [guideEntries.edges]
  );

  return (
    <Container>
      <h1>{title}</h1>
      <nav>
        <NavigationSection>
          <NavigationLink activeClassName="active" key="home" to={`/`}>
            Getting Started
          </NavigationLink>
        </NavigationSection>
        <NavigationSection>
          <h2>guides</h2>
          {guideRoutes.map(route => (
            <NavigationLink activeClassName="active" key={route.name} to={`/guides/${route.name}/`}>
              {route.displayName}
            </NavigationLink>
          ))}
        </NavigationSection>
        <NavigationSection>
          <h2>examples</h2>
          {exampleRoutes.map(route => (
            <NavigationLink
              activeClassName="active"
              key={route.name}
              to={`/examples/${route.name}/`}
            >
              {route.displayName}
            </NavigationLink>
          ))}
        </NavigationSection>
        <NavigationSection>
          <h2>api</h2>
          {apiRoutes.map(route => (
            <NavigationLink activeClassName="active" key={route.name} to={`/api/${route.name}/`}>
              <code>{route.name}</code>
            </NavigationLink>
          ))}
        </NavigationSection>
      </nav>
    </Container>
  );
});

Sidebar.propTypes = {
  title: PropTypes.string.isRequired,
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
