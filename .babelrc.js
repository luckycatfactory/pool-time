module.exports = {
  env: {
    production: {
      plugins: [['transform-react-remove-prop-types', { removeImport: true }]],
      presets: ['@babel/preset-react'],
    },
    test: {
      plugins: [['transform-react-remove-prop-types', { removeImport: true }]],
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
};
