import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Field, Label, Textarea } from '@zendeskgarden/react-forms';
import { Paragraph, SM, MD } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import faker from 'faker';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';

import {
  createPoolTimeProvider,
  ONE_SECOND,
  ONE_MINUTE,
  useRelativeTime,
} from '../../../react-pool-time/src';
import getNextId from '../utilities/getNextId';
import RenderCount from './RenderCount';

interface CommentEditorProps {
  readonly onAddComment: (text: string) => void;
}

interface Comment {
  readonly author: string;
  readonly avatar: string;
  readonly createdAt: number;
  readonly id: string;
  readonly text: string;
}

type CommentProps = Comment;

const PoolTimeProvider = createPoolTimeProvider({
  accuracies: [
    {
      upTo: ONE_MINUTE,
      within: ONE_SECOND,
    },
  ],
});

const Container = styled.div`
  background-color: #f0f0f0f0;
  border-radius: 2px;
  padding: 12px 8px;
`;

const StyledField = styled(Field)`
  margin-bottom: 8px;
`;

const CommentEditor = React.memo(({ onAddComment }: CommentEditorProps) => {
  const [comment, setComment] = useState('');

  const handleChange = useCallback((e) => {
    setComment(e.target.value);
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        if (comment) {
          onAddComment(comment);
          setComment('');
        }
        e.preventDefault();
      }
    },
    [comment, onAddComment]
  );

  const handleSubmitClick = useCallback(() => {
    onAddComment(comment);
    setComment('');
  }, [comment, onAddComment]);

  return (
    <div>
      <StyledField>
        <Label>Add a comment</Label>
        <Textarea
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          value={comment}
        />
      </StyledField>
      <Button
        disabled={!comment}
        isPrimary
        isStretched
        onClick={handleSubmitClick}
        size="small"
      >
        Add
      </Button>
    </div>
  );
});

CommentEditor.displayName = 'CommentEditor';

const CommentImage = styled.img`
  border-radius: 50%;
  height: 64px;
  width: 64px;
`;

const CommentContainer = styled.div`
  border-top: 1px dotted grey;
  display: flex;
  padding: 4px 0;
`;

const CommentShelf = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 120px;
`;

const CommentMain = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const CommentText = styled.div`
  flex: 1;
  padding: 8px 0;
`;

const CommentTimeAgo = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

const Comment = React.memo(
  ({ author, avatar, createdAt, text }: CommentProps) => {
    const { time } = useRelativeTime(createdAt);

    const timeAgo = useMemo(
      () => formatDistanceStrict(createdAt, time, { addSuffix: true }),
      [createdAt, time]
    );

    return (
      <CommentContainer>
        <CommentShelf>
          <CommentImage alt={`Avatar image for ${author}`} src={avatar} />
          <SM isBold>{author}</SM>
        </CommentShelf>
        <CommentMain>
          <CommentText>
            <Paragraph>{text}</Paragraph>
          </CommentText>
          <CommentTimeAgo>
            <RenderCount />
            <MD>{timeAgo}</MD>
          </CommentTimeAgo>
        </CommentMain>
      </CommentContainer>
    );
  }
);

Comment.displayName = 'Comment';

const currentUserAuthor = '@react-pool-time';
const currentUserAvatar = faker.internet.avatar();

const createComment = (text?: string): Comment => {
  const isCurrentUser = Boolean(text);

  const authorToUse = isCurrentUser
    ? currentUserAuthor
    : faker.internet.userName();
  const avatarToUse = isCurrentUser
    ? currentUserAvatar
    : faker.internet.avatar();
  const textToUse = isCurrentUser ? text : faker.hacker.phrase();
  const now = Date.now();

  return {
    author: authorToUse,
    avatar: avatarToUse,
    createdAt: now,
    id: getNextId(),
    text: textToUse,
  };
};

const Comments = React.memo(() => {
  const [comments, setComments] = useState(() => {
    const starterComment = createComment();

    return {
      allIds: [starterComment.id],
      byId: {
        [starterComment.id]: starterComment,
      },
    };
  });

  const addComment = useCallback((text?: string) => {
    setComments((previousComments) => {
      const newComment = createComment(text);

      return {
        allIds: [newComment.id, ...previousComments.allIds],
        byId: {
          ...previousComments.byId,
          [newComment.id]: newComment,
        },
      };
    });
  }, []);

  const handleEditorAddComment = useCallback(
    (text: string) => {
      addComment(text);
    },
    [addComment]
  );

  const commentsText = useMemo(() => {
    const numberOfComments = comments.allIds.length;
    const suffix = numberOfComments === 1 ? 'comment' : 'comments';

    return `${numberOfComments} ${suffix}`;
  }, [comments.allIds.length]);

  return (
    <PoolTimeProvider>
      <Container>
        <CommentEditor onAddComment={handleEditorAddComment} />
        <MD isBold>{commentsText}</MD>
        {comments.allIds.map((commentId) => {
          const comment = comments.byId[commentId];
          return (
            <Comment
              author={comment.author}
              avatar={comment.avatar}
              createdAt={comment.createdAt}
              id={comment.id}
              key={comment.id}
              text={comment.text}
            />
          );
        })}
      </Container>
    </PoolTimeProvider>
  );
});

Comments.displayName = 'Comments';

export default Comments;
