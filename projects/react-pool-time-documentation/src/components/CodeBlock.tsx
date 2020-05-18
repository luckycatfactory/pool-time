import React from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';

interface CodeBlockProps {
  readonly children: string;
  readonly language?: string;
}

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('shell', bash);

const CodeBlock = React.memo<CodeBlockProps>(
  ({ children, language }: CodeBlockProps) => (
    <SyntaxHighlighter language={language || 'jsx'} style={tomorrow}>
      {children.trim()}
    </SyntaxHighlighter>
  )
);

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
