import filesize from 'rollup-plugin-filesize';
import typescript from '@rollup/plugin-typescript';

export default [
  // Generate code distributions
  {
    external: ['react'],
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        globals: {
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
    external: ['react'],
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
