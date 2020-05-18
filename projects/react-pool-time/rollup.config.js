import filesize from 'rollup-plugin-filesize';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    external: ['react'],
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      filesize(),
      typescript({
        declaration: true,
        declarationDir: 'dist/types',
        sourceMap: true,
        rootDir: 'src',
      }),
    ],
  },
  {
    external: ['react'],
    input: 'src/index.ts',
    output: { file: 'dist/es/react-pool-time.js', format: 'es' },
    plugins: [filesize(), typescript()],
  },
];
