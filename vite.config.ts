import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    port: 8080,
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify(
      mode === "production"
        ? "https://gitgenius.vercel.app/api"
        : "http://localhost:3000/api"
    ),
  },
}));
