import globals from "globals";
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';
import importPlugin from "eslint-plugin-import";

// eslint-disable-next-line tsdoc/syntax
/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{ts,js,mjs,cjs}"] },
  importPlugin.flatConfigs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      tsdoc,
    },
    rules: {
      'tsdoc/syntax': 'warn',
      'no-unused-vars': 'off',
      "import/no-cycle": "error",
    },
    settings: {
      "import/resolver": {
        "typescript": true,
        "node": true,
      },
    },
  },
];