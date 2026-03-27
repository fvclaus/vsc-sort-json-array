import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";
import mochaPlugin from "eslint-plugin-mocha";

export default defineConfig([
  { ignores: ["**/generated/**", ".eslintrc.js", "**/out/**", ".vscode-test/**", "eslint.config.mts"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: { ...globals.node } }
  },
  tseslint.configs.recommended,
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.ts", "*.js", "*.mts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": ["warn", {
        allowExpressions: true,
      }],

      "@typescript-eslint/strict-boolean-expressions": ["error", {
        allowString: true,
        allowNumber: false,
        allowNullableObject: false,
      }],

      "@typescript-eslint/no-floating-promises": "error",
    }
  },
  {
    rules: {
      "linebreak-style": ["off"],
      "no-undef": ["error"],

      "max-len": ["error", {
        code: 160,
      }],

      "require-jsdoc": ["off"],
      "no-console": ["off"],
    }
  },
  {
    files: ["src/test/**/*.ts"],
    plugins: { mocha: mochaPlugin },
    extends: [mochaPlugin.configs.recommended],

    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },

    rules: {
      "mocha/no-setup-in-describe": ["off"],
      "mocha/no-hooks-for-single-case": ["off"],
      "@typescript-eslint/no-unused-expressions": "off"
    },
  },
  {
    files: ["./vscode/*.json"],
    language: "json/jsonc",
    plugins: {
      json,
    },
    ...json.configs.recommended,
  },
]);
