module.exports = {
  env: {
    test: {
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
    },
  },
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
