module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "ignorePatterns": [
    "*.config.js",
  ],
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    }
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "react"
  ],
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "max-len": [
      "warn",
      { "code": 120 }
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "comma-spacing": [
      "error",
      {
        "after": true
      }
    ],
    "key-spacing": [
      "error",
      {
        "afterColon": true
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn", // or "error"
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    // forbid usage of unused variables (marked with an _)
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: ["parameter", "variable"],
        leadingUnderscore: "forbid",
        filter: {
          // keep this one open for destructuring
          regex: "_*",
          match: false
        },
        format: null,
      },
      {
        selector: "parameter",
        leadingUnderscore: "require",
        format: null,
        modifiers: ["unused"],
      },
    ],
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};
