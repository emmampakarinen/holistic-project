import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: { host: "localhost", clientPort: 3000 },
    watch: { usePolling: true, interval: 150 },
    proxy: {
      "/api": {
        target: "http://server:5000",
        changeOrigin: true,
      },
    },
  },
  preview: { port: 3000, host: true },
});
