/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@llm": path.resolve(__dirname, "src/llm"),
      "@persistence": path.resolve(__dirname, "src/persistence"),
      "@ui": path.resolve(__dirname, "src/ui")
    }
  },
  test: {
    environment: "node",
    globals: true
  }
});
