import React from 'react';
import { XXL } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import SEO from '../components/Seo';

const FAQS = React.memo(() => (
  <>
    <SEO title="FAQs" />
    <XXL>Frequently Asked Questions</XXL>
    <Section>Eventually, this will be filled out.</Section>
  </>
));

FAQS.displayName = 'FAQS';

export default FAQS;
