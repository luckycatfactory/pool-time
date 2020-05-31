#!/usr/bin/env node
'use strict';

const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires
const bootstrap = require('commitizen/dist/cli/git-cz').bootstrap;

bootstrap({
  cliPath: path.join(__dirname, '../node_modules/commitizen'),
  config: {
    path: 'cz-conventional-changelog',
  },
});
