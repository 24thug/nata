import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use project subpath only for production hosting (e.g. GitHub Pages).
  base: process.env.NODE_ENV === "production" ? "/nata/" : "/",
  server: {
    allowedHosts: ["exceedingly-amicable-hake.cloudpub.ru"],
  },
});
