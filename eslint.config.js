import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'build', '.react-router']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // React Router framework-mode route modules export loader/meta/etc.
      // alongside their component; those are not Fast Refresh hazards.
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: [
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'meta',
            'links',
            'headers',
            'handle',
            'shouldRevalidate',
            'ErrorBoundary',
            'HydrateFallback',
            'Layout',
          ],
        },
      ],
    },
  },
])
