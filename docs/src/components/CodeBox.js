import React from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBox = React.memo(({ children, language }) => (
  <SyntaxHighlighter language={language} style={tomorrow}>
    {children}
  </SyntaxHighlighter>
));

CodeBox.displayName = 'CodeBox';

CodeBox.propTypes = {
  children: PropTypes.node.isRequired,
  language: PropTypes.string,
};

CodeBox.defaultProps = {
  language: 'javascript',
};

export default CodeBox;
