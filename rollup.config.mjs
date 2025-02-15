import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.esm.jsx',
      format: 'esm',
    },
  ],
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist',
    }),
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
};

