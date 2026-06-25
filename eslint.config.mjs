import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // RULES
    rules: {
      "react/no-unescaped-entities": "off",
      "prefer-const": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      // React Compiler advisories (eslint-config-next 16). These flag idiomatic,
      // correct code — event-handler side effects (window.location, Date.now)
      // and external-system syncs (Embla carousel). Kept as warnings so they
      // stay visible without blocking `next build`. TypeScript is the strict
      // correctness gate.
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // IGNORES
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;