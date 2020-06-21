import filesize from 'rollup-plugin-filesize';
import typescript from '@rollup/plugin-typescript';

export default [
  // Generate code distributions
  {
    input: 'src/index.ts',
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
        name: 'PoolTimeCore',
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
    input: 'src/index.ts',
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
