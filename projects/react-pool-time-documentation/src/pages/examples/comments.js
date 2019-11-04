import React from 'react';
import Comments from './snippets/comments';

const CommentsExample = React.memo(() => {
  return (
    <>
      <h2>Comments Example</h2>
      <p>
        What follows is an example that demonstrates the <code>useRelativeTime</code> hook.
      </p>
      <Comments />
    </>
  );
});

CommentsExample.displayName = 'CommentsExample';

export default CommentsExample;
