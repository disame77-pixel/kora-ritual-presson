/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// En GitHub Pages la app vive en /<nombre-del-repo>/.
// El workflow pasa BASE_PATH según el nombre real del repo.
const base = process.env.BASE_PATH ?? "/kora-ritual-press/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "KŌRA Ritual Press",
        short_name: "KŌRA",
        description: "Mi calculadora de precios para sets press on.",
        lang: "es-CO",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#EEE9EC",
        theme_color: "#8A1C38",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  test: {
    environment: "node",
  },
});
