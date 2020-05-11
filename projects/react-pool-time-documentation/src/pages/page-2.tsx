import React from 'react';

import SEO from '../components/Seo';

const SecondPage = React.memo(() => (
  <>
    <SEO title="Page two" />
  </>
));

SecondPage.displayName = 'SecondPage';

export default SecondPage;
