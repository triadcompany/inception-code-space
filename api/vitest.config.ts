import { defineConfig } from "vitest/config";

export default defineConfig({
  // Stop Vite from walking up and loading the parent project's PostCSS/Tailwind config.
  css: { postcss: { plugins: [] } },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    css: false,
    env: {
      DATABASE_URL: "postgres://placeholder:placeholder@localhost:5432/placeholder",
      JWT_SECRET: "test-secret-must-be-at-least-16-chars-long",
      INTERNAL_TOKEN: "test-internal-token",
      NODE_ENV: "test",
      CORS_ORIGINS: "",
    },
  },
});
