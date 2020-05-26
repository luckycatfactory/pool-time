import React from 'react';
import { Paragraph, LG } from '@zendeskgarden/react-typography';

import Section from '../components/Section';
import SEO from '../components/Seo';

const CreatePoolTimeProvider = React.memo(() => (
  <>
    <SEO title="createPoolTimeProvider" />
    <LG isBold isMonospace>
      createPoolTimeProvider(configuration: Configuration): React.FC
    </LG>
    <Section>
      <Paragraph>This is where it all begins.</Paragraph>
    </Section>
  </>
));

CreatePoolTimeProvider.displayName = 'CreatePoolTimeProvider';

export default CreatePoolTimeProvider;
