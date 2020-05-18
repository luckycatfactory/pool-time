import React from 'react';

import SEO from '../components/Seo';

const IndexPage = React.memo(() => (
  <>
    <SEO title="Home" />
  </>
));

IndexPage.displayName = 'IndexPage';

export default IndexPage;
