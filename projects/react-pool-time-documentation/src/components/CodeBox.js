import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const trim = string => string.replace(/^\s+|\s+$/g, '');

const CodeBox = React.memo(({ children, language }) => {
  const trimmedString = useMemo(() => trim(children), [children]);

  return (
    <SyntaxHighlighter language={language} style={tomorrow}>
      {trimmedString}
    </SyntaxHighlighter>
  );
});

CodeBox.displayName = 'CodeBox';

CodeBox.propTypes = {
  children: PropTypes.string.isRequired,
  language: PropTypes.string,
};

CodeBox.defaultProps = {
  language: 'javascript',
};

export default CodeBox;
