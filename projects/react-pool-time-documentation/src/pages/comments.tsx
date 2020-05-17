import React from 'react';
import { XXL } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import CommentsExample from '../components/CommentsExample';

const Comments = React.memo(() => {
  return (
    <>
      <Section>
        <XXL>Comments Example</XXL>
      </Section>
      <Section>
        <CommentsExample />
      </Section>
    </>
  );
});

Comments.displayName = 'Comments';

export default Comments;
