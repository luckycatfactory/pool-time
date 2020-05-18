import React from 'react';
import { Paragraph, LG } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import SEO from '../components/Seo';

const UseRelativeTime = React.memo(() => (
  <>
    <SEO title="useRelativeTime" />
    <LG isBold isMonospace>
      useRelativeTime(targetTime: number): UseRelativeTimeResponse
    </LG>
    <Section>
      <Paragraph>This is what you were looking for.</Paragraph>
    </Section>
  </>
));

UseRelativeTime.displayName = 'UseRelativeTime';

export default UseRelativeTime;
