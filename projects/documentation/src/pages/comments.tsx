import React from 'react';
import { Paragraph, XXL } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import CommentsExample from '../components/CommentsExample';
import SEO from '../components/Seo';
import CodeBlock from '../components/CodeBlock';

const configurationExampleString = `
const PoolTimeProvider = createPoolTimeProvider({
  accuracies: [
    {
      upTo: FIVE_SECONDS,
      within: ONE_SECOND,
    },
    {
      upTo: THIRTY_SECONDS,
      within: FIVE_SECONDS,
    },
    {
      upTo: ONE_MINUTE,
      within: TEN_SECONDS,
    },
    {
      upTo: FIVE_MINUTES,
      within: THIRTY_SECONDS,
    },
    {
      upTo: ETERNITY,
      within: ONE_MINUTE,
    },
  ],
});
`;

const Comments = React.memo(() => (
  <>
    <SEO title="Comments Example" />
    <Section>
      <XXL>Comments Example</XXL>
      <Paragraph>
        In the example below, a stream of comments is rendered. The following
        configuration is used:
      </Paragraph>
      <CodeBlock>{configurationExampleString}</CodeBlock>
    </Section>
    <Section>
      <CommentsExample />
    </Section>
  </>
));

Comments.displayName = 'Comments';

export default Comments;
