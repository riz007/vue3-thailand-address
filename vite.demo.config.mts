import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname, "demo"),
  plugins: [vue()],
  resolve: {
    alias: {
      "vue3-thailand-address": resolve(__dirname, "src/index.ts"),
      "vue3-thailand-address/data": resolve(__dirname, "src/data.ts"),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname)],
    },
  },
});
