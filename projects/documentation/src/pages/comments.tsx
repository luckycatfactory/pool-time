import React from 'react';
import { XXL } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import CommentsExample from '../components/CommentsExample';
import SEO from '../components/Seo';

const Comments = React.memo(() => (
  <>
    <SEO title="Comments Example" />
    <Section>
      <XXL>Comments Example</XXL>
    </Section>
    <Section>
      <CommentsExample />
    </Section>
  </>
));

Comments.displayName = 'Comments';

export default Comments;
