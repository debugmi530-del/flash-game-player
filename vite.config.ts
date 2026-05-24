import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    // Copy Ruffle files so Android WebView can load them from a static path
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@ruffle-rs/ruffle/*",
          dest: "ruffle",
        },
      ],
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["game.swf", "ruffle/**/*"],
      manifest: {
        name: "Flash Game Player",
        short_name: "FlashGame",
        description: "Play Flash games offline on any device",
        theme_color: "#1a1a2e",
        background_color: "#1a1a2e",
        display: "standalone",
        orientation: "landscape",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,swf}"],
        maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve("./src") } },
  build: { outDir: "dist", emptyOutDir: true },
  server: { port: 3000, host: "0.0.0.0" },
});
