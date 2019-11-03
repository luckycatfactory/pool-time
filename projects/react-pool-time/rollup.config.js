import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import autoExternal from 'rollup-plugin-auto-external';

const plugins = [
  resolve({
    mainFields: ['module', 'main', 'src'],
  }),
  eslint(),
  babel({
    exclude: 'node_modules/**',
  }),
  cleanup(),
];

const productionConfig = {
  external: ['react'],
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
  ],
  plugins,
};

const productionConfigWithMinification = {
  ...productionConfig,
  output: {
    file: 'dist/bundle.min.js',
    format: 'cjs',
  },
  plugins: [
    autoExternal(),
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
