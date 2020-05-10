import React from "react"
import { Link } from "gatsby"

import Image from "../components/Image"
import SEO from "../components/Seo"

const IndexPage = React.memo(() => (
  <>
    <SEO title="Home" />
    <Link to="/page-2/">Go to page 2</Link>
  </>
))

export default IndexPage
