import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    // sockjs-client가 Node.js 환경의 global 객체를 참조하므로 브라우저용 폴리필
    global: "globalThis",
  },
});