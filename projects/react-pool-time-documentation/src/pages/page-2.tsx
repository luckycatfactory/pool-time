// Gatsby supports TypeScript natively!
import React from "react"
import { PageProps, Link } from "gatsby"

import Layout from "../components/Layout"
import SEO from "../components/Seo"

const SecondPage = React.memo((props: PageProps) => (
  <>
    <SEO title="Page two" />
  </>
))

export default SecondPage
