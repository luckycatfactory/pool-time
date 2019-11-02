const config = {
  extends: [
    'eslint:recommended',

    // A side effect of this: No more incorrect 'unused' errors for variables used in JSX
    'plugin:react/recommended',
  ],
  parser: 'babel-eslint',
  plugins: ['prettier', 'react-hooks', 'jest'],
  rules: {
    'no-plusplus': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'sort-keys': ['error', 'asc', { natural: true }],
    strict: 'error',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true,
  },
  settings: {
    react: { version: 'detect' },
  },
};

module.exports = config;
