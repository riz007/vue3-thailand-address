import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        data: resolve(__dirname, "src/data.ts"),
      },
      name: "Vue3ThailandAddress",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: ["vue", /^@riz007\/thai-address-data(\/.*)?$/],
      output: {
        exports: "named",
      },
    },
  },
});
