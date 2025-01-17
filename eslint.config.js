import { fileURLToPath } from 'url'
import reactPlugin from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import enforceLogging from './eslint-rules/enforce-logging.js'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      'dist/**/*',
      'build/**/*',
      'node_modules/**/*',
      'src/lib/logger.ts',
      '**/test-*.ts',
      '**/scripts/**/*',
      '**/*.{spec,test}.{ts,tsx}',
      '**/tests/**/*',
      '**/e2e/**/*',
      'src/components/ui/**'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default,
      'enforce-logging': { rules: { 'enforce-logging': enforceLogging } },
      'react': reactPlugin,
      'import': importPlugin
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: {} }
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true, ignoreIIFE: true }],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        },
        {
          selector: 'property',
          format: ['camelCase', 'snake_case', 'UPPER_CASE'],
          filter: {
            regex: '^(VITE_|created_at|updated_at|deleted_at|user_id|email_address|first_name|last_name|is_guest|last_seen|ADD_TOAST|UPDATE_TOAST|DISMISS_TOAST|REMOVE_TOAST).*$',
            match: true
          }
        }
      ],
      'enforce-logging/enforce-logging': ['error', {
        excludeSmallFunctions: true,
        smallFunctionThreshold: 3,
        excludePatterns: [
          '^(get|set)[A-Z].*$',
          '^handle(Change|Click|Submit|Delete)$',
          '^on[A-Z].*$',
          '^render[A-Z].*$',
          '^use[A-Z].*$',
          '^map[A-Z].*$',
          '^filter[A-Z].*$',
          '^reduce[A-Z].*$',
          '^format[A-Z].*$',
          '^transform[A-Z].*$',
          '^validate[A-Z].*$',
          '^compute[A-Z].*$',
          '^parse[A-Z].*$',
          '^serialize[A-Z].*$',
          '^normalize[A-Z].*$',
          '^denormalize[A-Z].*$',
          '^to[A-Z].*$',
          '^from[A-Z].*$',
          '^is[A-Z].*$',
          '^has[A-Z].*$',
          '^should[A-Z].*$',
          '^can[A-Z].*$',
          '^will[A-Z].*$',
          '^did[A-Z].*$',
          '^component.*$',
          '^anonymous$'
        ]
      }]
    }
  },
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'enforce-logging/enforce-logging': 'off'
    }
  },
  {
    files: ['src/lib/contexts/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  {
    files: ['**/*.{spec,test}.{ts,tsx}', '**/cypress/**/*.{ts,tsx}', '**/test-*.ts', '**/scripts/**/*.ts'],
    rules: {
      'enforce-logging/enforce-logging': 'off',
      'no-console': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  },
  {
    files: ['cypress/**/*.{ts,tsx}', '**/*.cy.{ts,tsx}', 'cypress.config.ts'],
    languageOptions: {
      globals: {
        cy: true,
        Cypress: true,
        before: true,
        after: true,
        beforeEach: true,
        afterEach: true,
        describe: true,
        it: true,
        assert: true,
        expect: true
      }
    },
    rules: {
      'enforce-logging/enforce-logging': 'off',
      'no-console': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  }
] 