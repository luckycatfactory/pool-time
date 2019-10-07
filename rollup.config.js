import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  eslint(),
  babel({
    exclude: 'node_modules/**',
  }),
];

const productionConfig = {
  external: ['react'],
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins,
};

const productionConfigWithMinification = {
  ...productionConfig,
  output: {
    file: 'dist/bundle.min.js',
    format: 'cjs',
  },
  plugins: [
    ...plugins,
    terser({
      mangle: {
        properties: true,
        toplevel: true,
      },
    }),
  ],
};

export default [productionConfig, productionConfigWithMinification];
