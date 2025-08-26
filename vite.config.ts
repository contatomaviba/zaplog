// vite.config.ts (na raiz)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // seu app React está em /client
  root: "client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    // outDir é relativo ao root -> gera client/dist
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    // permite importar arquivos fora do /client (ex.: /shared)
    fs: {
      allow: [path.resolve(__dirname, "shared")],
    },
    // só vale em DEV; em produção o vercel.json manda /api/ pra função serverless
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
