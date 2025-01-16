import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        process: "readonly",
        // React globals
        React: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
      "import": importPlugin
    },
    settings: {
      react: {
        version: "detect"
      },
      "import/resolver": {
        typescript: true,
        node: true
      }
    },
    rules: {
      // TypeScript strict rules
      ...tseslint.configs["strict"].rules,
      ...tseslint.configs["recommended"].rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true,
        "allowHigherOrderFunctions": true,
        "allowDirectConstAssertionInArrowFunctions": true,
        "allowConciseArrowFunctionExpressionsStartingWithVoid": true
      }],
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: "type-imports",
        fixStyle: "inline-type-imports"
      }],
      "@typescript-eslint/consistent-type-exports": ["error", {
        fixMixedExportsWithInlineTypeSpecifier: true
      }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "allow"
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow"
        },
        {
          selector: "typeLike",
          format: ["PascalCase"]
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"]
        }
      ],

      // React specific rules
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ],
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", {
        props: "never",
        children: "never"
      }],
      "react/jsx-no-useless-fragment": ["error", {
        allowExpressions: true
      }],
      "react/jsx-pascal-case": "error",
      "react/jsx-sort-props": ["error", {
        callbacksLast: true,
        shorthandFirst: true,
        multiline: "last",
        ignoreCase: true,
        reservedFirst: true
      }],

      // Import organization
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }],

      // Error handling
      "no-throw-literal": "error",
      "@typescript-eslint/no-throw-literal": "error",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "curly": ["error", "all"],
      "eqeqeq": ["error", "always", { "null": "ignore" }],
      "no-alert": "error",
      "no-else-return": ["error", { allowElseIf: false }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-return-await": "error",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "prefer-const": "error",
      "spaced-comment": ["error", "always", {
        "line": {
          "markers": ["/"],
          "exceptions": ["-", "+"]
        },
        "block": {
          "markers": ["!"],
          "exceptions": ["*"],
          "balanced": true
        }
      }]
    }
  }
]; 