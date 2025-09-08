import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Allow unused vars in API route handlers (they're required by Next.js interface)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^(request|req|response|res|next)$",
          varsIgnorePattern: "^(request|req|response|res|next)$",
        },
      ],
      // Allow any type for NextAuth adapter and user object compatibility
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: true,
        },
      ],
    },
  },
  {
    files: ["src/lib/auth.ts", "src/app/api/**/*.ts"],
    rules: {
      // Allow any types in auth configuration for NextAuth compatibility
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
