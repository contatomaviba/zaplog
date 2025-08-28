// vite.config.ts (na raiz)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Certifique-se que 'path' está importado

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
    // outDir é relativo ao 'root' (que é 'client').
    // Para que o build do frontend vá para a pasta 'dist' na raiz do projeto (onde está o vercel.json),
    // precisamos subir um nível (..) a partir de 'client' e então ir para 'dist'.
    outDir: "../dist", // <--- MUDANÇA AQUI: Agora vai para [raiz_projeto]/dist
    
    // MUITO IMPORTANTE: Define como false para não apagar todo o conteúdo da pasta 'dist' da raiz.
    // Isso evita que o build do seu backend (server e shared) seja deletado pelo Vite.
    emptyOutDir: false, // <--- MUDANÇA AQUI: Não apagar a pasta de destino
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