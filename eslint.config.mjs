import globals from "globals";
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

// eslint-disable-next-line tsdoc/syntax
/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.ts"] },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        allowAutomaticSingleRunInference: false,
        disallowAutomaticSingleRunInference: true,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      tsdoc,
    },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
];