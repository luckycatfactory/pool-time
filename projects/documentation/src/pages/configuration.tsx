import React from 'react';
import { XXL } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import SEO from '../components/Seo';

const Comments = React.memo(() => (
  <>
    <SEO title="Configuration" />
    <XXL>Configuration</XXL>
    <Section>here is stuff about configuration</Section>
  </>
));

Comments.displayName = 'Comments';

export default Comments;
