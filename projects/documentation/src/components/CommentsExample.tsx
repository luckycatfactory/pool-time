import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Label, Textarea } from '@zendeskgarden/react-forms';
import { Paragraph, SM, MD } from '@zendeskgarden/react-typography';
import faker from 'faker';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import PoolTime from '@luckycatfactory/pool-time-core';
import {
  createPoolTimeProvider,
  ONE_SECOND,
  FIVE_SECONDS,
  TEN_SECONDS,
  THIRTY_SECONDS,
  ONE_MINUTE,
  FIVE_MINUTES,
  ETERNITY,
  useRelativeTime,
} from '@luckycatfactory/react-pool-time';

import getNextId from '../utilities/getNextId';
import RenderCount from './RenderCount';

interface CommentEditorProps {
  readonly onAddComment: (text: string) => void;
}

interface Comment {
  readonly author: string;
  readonly avatar: string;
  readonly createdAt: number;
  readonly isByCurrentUser: boolean;
  readonly id: string;
  readonly text: string;
}

type CommentProps = Comment & { onRemoveComment: (id: string) => void };

const poolTime = new PoolTime({
  configuration: {
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
  },
});

const PoolTimeProvider = createPoolTimeProvider(poolTime);

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
  ({
    author,
    avatar,
    createdAt,
    isByCurrentUser,
    id,
    onRemoveComment,
    text,
  }: CommentProps) => {
    const { time } = useRelativeTime(createdAt);

    const timeAgo = useMemo(
      () =>
        formatDistanceStrict(createdAt, time, {
          addSuffix: true,
          roundingMethod: 'floor',
        }),
      [createdAt, time]
    );

    const handleDeleteClick = useCallback(() => {
      onRemoveComment(id);
    }, [id, onRemoveComment]);

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
            {isByCurrentUser && (
              <Button isDanger isLink onClick={handleDeleteClick} size="small">
                Delete
              </Button>
            )}
            <RenderCount />
            <MD>{timeAgo}</MD>
          </CommentTimeAgo>
        </CommentMain>
      </CommentContainer>
    );
  }
);

Comment.displayName = 'Comment';

interface CurrentUser {
  readonly author: string;
  readonly avatar: string;
}

const createComment = (text?: string, currentUser?: CurrentUser): Comment => {
  const isCurrentUser = Boolean(text);

  const authorToUse = isCurrentUser
    ? currentUser.author
    : faker.internet.userName();
  const avatarToUse = isCurrentUser
    ? currentUser.avatar
    : faker.internet.avatar();
  const textToUse = isCurrentUser ? text : faker.hacker.phrase();
  const now = Date.now();

  return {
    author: authorToUse,
    avatar: avatarToUse,
    createdAt: now,
    id: getNextId(),
    isByCurrentUser: isCurrentUser,
    text: textToUse,
  };
};

const Comments = React.memo(() => {
  const currentUser = useMemo(
    () => ({
      author: '@pool-time',
      avatar: faker.internet.avatar(),
    }),
    []
  );

  const [comments, setComments] = useState(() => {
    const starterComment = createComment();

    return {
      allIds: [starterComment.id],
      byId: {
        [starterComment.id]: starterComment,
      },
    };
  });

  const addComment = useCallback(
    (text?: string) => {
      setComments((previousComments) => {
        const newComment = createComment(text, currentUser);

        return {
          allIds: [newComment.id, ...previousComments.allIds],
          byId: {
            ...previousComments.byId,
            [newComment.id]: newComment,
          },
        };
      });
    },
    [currentUser]
  );

  const removeComment = useCallback((id: string) => {
    setComments((previousComments) => {
      const nextById = Object.keys(previousComments.byId).reduce(
        (accumulator, commentId) => {
          if (commentId !== id) {
            accumulator[commentId] = previousComments.byId[commentId];
          }
          return accumulator;
        },
        {}
      );

      return {
        allIds: previousComments.allIds.filter((commentId) => commentId !== id),
        byId: nextById,
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
              isByCurrentUser={comment.isByCurrentUser}
              id={comment.id}
              key={comment.id}
              onRemoveComment={removeComment}
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
