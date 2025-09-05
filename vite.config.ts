// vite.config.ts (raiz)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isCodespace = Boolean(process.env.CODESPACE_NAME || process.env.CODESPACES);
const codespaceName = process.env.CODESPACE_NAME;
const forwardingDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev";
const devPort = 5173;

export default defineConfig({
  root: "client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: false,
  },
  server: {
    host: true,
    port: devPort,
    open: false,
    hmr: isCodespace && codespaceName
      ? {
          protocol: "wss",
          host: `${codespaceName}-${devPort}.${forwardingDomain}`,
          clientPort: 443,
        }
      : undefined,
    fs: {
      allow: [
        path.resolve(__dirname, "client"),
        path.resolve(__dirname, "shared"),
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});

