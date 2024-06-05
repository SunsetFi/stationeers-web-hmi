import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

declare const process: {
  env: {
    NODE_ENV: string;
  };
};

const isProd = process.env.NODE_ENV === "production";

const NamedChunks = {
  react: ["react", "react-dom"],
  router: ["react-router", "react-router-dom"],
  emotion: ["@emotion/react", "@emotion/styled"],
  charts: ["@mui/x-charts", "d3-color", "d3-delaunay", "d3-scale", "d3-shape"],
  icons: ["@mui/icons-material"],
  material: ["@mui"],
  math: ["mathjs"],
  rxjs: ["rxjs", "scheduler"],
  lodash: ["lodash"],
};

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

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // Check explicit groups
            for (const [name, modules] of Object.entries(NamedChunks)) {
              if (modules.some((x) => id.includes(`/node_modules/${x}/`))) {
                return name;
              }
            }

            // Everything else from node_modules is vendor
            return "vendor";
          }
        },
      },
    },
  },

  server: {
    port: 8080,
  },
});
