import filesize from 'rollup-plugin-filesize';
import typescript from '@rollup/plugin-typescript';

const external = ['@pool-time/pool-time-core', 'react'];
const input = 'src/index.ts';

export default [
  // Generate code distributions
  {
    external,
    input,
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        globals: {
          '@pool-time/pool-time-core': 'PoolTimeCore',
          react: 'React',
        },
        name: 'ReactPoolTime',
        sourcemap: true,
      },
    ],
    plugins: [
      filesize(),
      typescript({
        sourceMap: true,
        rootDir: 'src',
      }),
    ],
  },
  // Generate type distributions
  {
    external,
    input,
    output: {
      dir: 'dist/types',
      sourcemap: true,
    },
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist/types',
        sourceMap: true,
        rootDir: 'src',
      }),
    ],
  },
];
