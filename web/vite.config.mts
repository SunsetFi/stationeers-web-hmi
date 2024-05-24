import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

declare const process: {
  env: {
    NODE_ENV: string;
  };
};

const isProd = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
  base: isProd ? "/station-hmi/" : "/",
  plugins: [react(), checker({ typescript: true })],

  resolve: {
    alias: {
      "@": "/src",
    },
    preserveSymlinks: true,
  },

  server: {
    port: 8080,
  },
});
