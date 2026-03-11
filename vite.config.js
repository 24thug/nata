import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/nata/",
  server: {
    allowedHosts: ["exceedingly-amicable-hake.cloudpub.ru"],
  },
});
