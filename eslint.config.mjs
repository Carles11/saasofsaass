import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // RULES
    rules: {
      "react/no-unescaped-entities": "off",
      "prefer-const": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
    },
  },
  {
    // IGNORES
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;