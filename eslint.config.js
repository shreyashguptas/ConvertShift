const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      '*.config.js',
      'public/**',
    ],
  },
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

