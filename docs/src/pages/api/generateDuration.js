import React, { useMemo } from 'react';
import { graphql, useStaticQuery } from 'gatsby';

const durationsQuery = graphql`
  {
    allFile(filter: { sourceInstanceName: { eq: "durations" } }) {
      edges {
        node {
          name
        }
      }
    }
  }
`;

const GenerateDuration = React.memo(() => {
  const durations = useStaticQuery(durationsQuery);
  const durationNames = useMemo(() => durations.allFile.edges.map(edge => edge.node.name), [
    durations.allFile.edges,
  ]);

  return (
    <>
      <h2>
        <code>generateDuration(key, value)</code>
      </h2>
      <p>We provide a handful of durations for you to use.</p>
      <code>{durationNames.join(', ')}</code>
      <p>However, you might want some additional durations.</p>
    </>
  );
});

GenerateDuration.displayName = 'GenerateDuration';

export default GenerateDuration;
