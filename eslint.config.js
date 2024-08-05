import typescriptEslintParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';

const config = [
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'public/'],
  },
  {
    files: ['src/**/*.ts', '__tests__/**/*.ts'],
    languageOptions: {
      parser: typescriptEslintParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: 'value' },
      ],
    },
  },
];

export default config;
