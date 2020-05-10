import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist/types',
        sourceMap: true,
        rootDir: 'src',
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/es/react-pool-time.js', format: 'es' },
    plugins: [typescript()],
  },
];
