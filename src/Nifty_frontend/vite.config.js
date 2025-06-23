import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";
// Hapus import dotenv karena Vite sudah handle ini otomatis untuk variabel VITE_
// import dotenv from "dotenv";

// Hapus baris ini karena Vite akan memuat file .env otomatis dari root project frontend
// dotenv.config({ path: "../../.env" });

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    https: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943", // Pastikan port dfx Anda sesuai
        changeOrigin: true,
      },
    },
    // Jika Anda sebelumnya memiliki konfigurasi CSP di sini untuk pengembangan, Anda bisa tambahkan kembali:
    // headers: {
    //   'Content-Security-Policy': `
    //     default-src 'self';
    //     script-src 'self' 'unsafe-inline' 'unsafe-eval';
    //     style-src 'self' 'unsafe-inline';
    //     img-src 'self' data: https://ipfs.io/ https://*.mypinata.cloud;
    //     connect-src 'self' http://localhost:* https://icp0.io https://*.icp0.io https://icp-api.io https://api.pinata.cloud;
    //   `
    // }
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }), // Tetap pertahankan ini jika Anda butuh CANISTER_ID di frontend
    environment("all", { prefix: "DFX_" }),       // Tetap pertahankan ini jika Anda butuh DFX_NETWORK di frontend
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
    ],
    dedupe: ["@dfinity/agent"],
  },
});