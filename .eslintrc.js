const config = {
  parser: 'babel-eslint',
  // plugins: ['jest'],
  // extends: ['airbnb', 'plugin:prettier/recommended', 'prettier/react'],
  rules: {
    'no-plusplus': 'off',
    // 'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    // 'prettier/prettier': 'error',
    // 'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'sort-keys': ['error', 'asc', { natural: true }],
    strict: 'error',
  },
  env: {
    browser: true,
    es6: true,
    // 'jest/globals': true,
    node: true,
    // jest: true,
  },
  settings: {
    // 'import/resolver': {
    //   node: {},
    //   webpack: {},
    // },
    react: { version: 'detect' },
  }
};

module.exports = config;
