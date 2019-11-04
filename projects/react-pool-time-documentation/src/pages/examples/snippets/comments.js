import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  generateTimeProviders,
  useRelativeTime,
  ONE_SECOND,
  FIVE_SECONDS,
  TEN_SECONDS,
  FIFTEEN_SECONDS,
  THIRTY_SECONDS,
  ONE_MINUTE,
} from 'react-pool-time';
import useRenderCount from '../../../hooks/useRenderCount';

const TimeProviders = generateTimeProviders(
  [ONE_SECOND, FIVE_SECONDS, TEN_SECONDS, FIFTEEN_SECONDS, THIRTY_SECONDS, ONE_MINUTE],
  [
    {
      difference: ONE_SECOND,
      maximumAccuracy: ONE_SECOND,
      minimumAccuracy: ONE_SECOND,
      preferredAccuracy: ONE_SECOND,
    },
    {
      difference: FIFTEEN_SECONDS,
      maximumAccuracy: FIVE_SECONDS,
      minimumAccuracy: FIVE_SECONDS,
      preferredAccuracy: FIVE_SECONDS,
    },
    {
      difference: THIRTY_SECONDS,
      maximumAccuracy: TEN_SECONDS,
      minimumAccuracy: TEN_SECONDS,
      preferredAccuracy: TEN_SECONDS,
    },
    {
      difference: ONE_MINUTE,
      maximumAccuracy: FIFTEEN_SECONDS,
      minimumAccuracy: FIFTEEN_SECONDS,
      preferredAccuracy: FIFTEEN_SECONDS,
    },
  ]
);

const Comment = React.memo(({ createdAt, id, onRemove, text }) => {
  const { timeDifference } = useRelativeTime(createdAt);
  const renderCount = useRenderCount();

  const handleRemoval = useCallback(() => {
    onRemove(id);
  }, [id, onRemove]);

  return (
    <div>
      <h3>{text}</h3>
      <div>{timeDifference}</div>
      <div>{renderCount}</div>
      <button onClick={handleRemoval}>Remove</button>
    </div>
  );
});

Comment.displayName = 'Comment';

Comment.propTypes = {
  createdAt: PropTypes.number.isRequired,
  id: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

let currentId = 0;

const generateComment = text => ({
  createdAt: Date.now(),
  id: currentId++,
  text,
});

const Comments = React.memo(() => {
  const [currentText, setCurrentText] = useState('');
  const [comments, setComments] = useState([]);

  const [currentInterval, setCurrentInterval] = useState(null);
  const [currentRegistrations, setCurrentRegistrations] = useState({});

  const handleIntervalUpdate = useCallback(interval => {
    setCurrentInterval(interval);
  }, []);
  const handleRegistrationsUpdate = useCallback(registrations => {
    setCurrentRegistrations(registrations);
  }, []);

  const handleTextChange = useCallback(event => {
    setCurrentText(event.target.value);
  }, []);

  const handleCommentSubmission = useCallback(
    event => {
      event.preventDefault();
      setComments(comments => [...comments, generateComment(currentText)]);
      setCurrentText('');
    },
    [currentText]
  );

  const handleCommentRemoval = useCallback(id => {
    setComments(comments => comments.filter(comment => comment.id !== id));
  }, []);

  return (
    <TimeProviders
      onIntervalUpdate={handleIntervalUpdate}
      onRegistrationsUpdate={handleRegistrationsUpdate}
    >
      <h2>Comments</h2>
      <div>The interval is currently set to {currentInterval}ms.</div>
      <div>{JSON.stringify(currentRegistrations)}</div>
      <form>
        <textarea onChange={handleTextChange} value={currentText} />
        <button onClick={handleCommentSubmission} type="submit">
          Submit
        </button>
      </form>
      {comments.map(({ createdAt, id, text }) => (
        <Comment
          key={id}
          createdAt={createdAt}
          id={id}
          onRemove={handleCommentRemoval}
          text={text}
        />
      ))}
    </TimeProviders>
  );
});

Comments.displayName = 'Comments';

export default Comments;
