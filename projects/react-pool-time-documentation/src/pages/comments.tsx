import React from 'react';

import {
  createPoolTimeProvider,
  ONE_SECOND,
  ONE_MINUTE,
  useRelativeTime,
} from '../../../react-pool-time/src';

interface CommentProps {
  readonly targetTime: number;
}

const PoolTimeProvider = createPoolTimeProvider({
  accuracies: [
    {
      upTo: ONE_MINUTE,
      within: ONE_SECOND,
    },
  ],
});

const Comment = React.memo(({ targetTime }: CommentProps) => {
  const { time } = useRelativeTime(targetTime);

  console.log('HEY MAN', time);

  return <div>Hey there {time}</div>;
});

Comment.displayName = 'Comment';

const comments = [Date.now() - 1000, Date.now() - 5000, Date.now() - 10000];

const Comments = React.memo(() => (
  <PoolTimeProvider>
    {comments.map((comment) => (
      <Comment key={comment} targetTime={comment} />
    ))}
  </PoolTimeProvider>
));

Comments.displayName = 'Comments';

export default Comments;
