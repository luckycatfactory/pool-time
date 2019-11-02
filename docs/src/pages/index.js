import React from "react"

import SEO from "../components/Seo"

const IndexPage = React.memo(() => (
  <>
    <SEO title="Home" />
    <h1>Go Go Go</h1>
  </>
))

IndexPage.displayName = "IndexPage"

export default IndexPage
