import babel from 'rollup-plugin-babel';
import { eslint } from "rollup-plugin-eslint";

export default {
  external: ['react'],
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
