import React from 'react';
import { Paragraph, LG, XL, XXL } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import SEO from '../components/Seo';

const Motivation = React.memo(() => (
  <>
    <SEO title="Motivation" />
    <XXL>Motivation</XXL>
    <Section>
      <XL>Accuracy</XL>
      <Paragraph>
        When people set a timer for a given time, they&apos;re prone to set a
        timer for the time they&apos;re trying to measure.
      </Paragraph>
    </Section>
    <Section>
      <XL>Performance</XL>
      <Paragraph>
        Having a bunch of timers is not great. Also, people tend to set all
        timers to the least common denominator.
      </Paragraph>
      <Paragraph>
        Performance of a given application should be improved through two means:
      </Paragraph>
      <LG>Timer Delegation</LG>
      <Paragraph>
        Delegating to a single timer makes applications more snappy.
      </Paragraph>
      <LG>As-Needed Accuracy</LG>
      <Paragraph>
        An API can encourage applications to minimize their timer frequency.
      </Paragraph>
    </Section>
  </>
));

Motivation.displayName = 'Motivation';

export default Motivation;
