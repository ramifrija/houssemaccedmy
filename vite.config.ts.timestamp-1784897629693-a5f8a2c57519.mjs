// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/ramzi/OneDrive/Bureau/houssemaccedmy/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ramzi/OneDrive/Bureau/houssemaccedmy/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/ramzi/OneDrive/Bureau/houssemaccedmy/node_modules/lovable-tagger/dist/index.js";
import { createClient } from "file:///C:/Users/ramzi/OneDrive/Bureau/houssemaccedmy/node_modules/@supabase/supabase-js/dist/main/index.js";
var __vite_injected_original_dirname = "C:\\Users\\ramzi\\OneDrive\\Bureau\\houssemaccedmy";
function localApiPlugin(env) {
  return {
    name: "local-api-plugin",
    configureServer(server) {
      server.middlewares.use("/api/create-user", async (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          return res.end();
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: "Method not allowed" }));
        }
        let bodyStr = "";
        req.on("data", (chunk) => {
          bodyStr += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const body = JSON.parse(bodyStr);
            const authHeader = req.headers.authorization;
            if (!authHeader) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: "Non autoris\xE9" }));
            }
            const supabaseUrl = env.VITE_SUPABASE_URL;
            const anonKey = env.VITE_SUPABASE_ANON_KEY;
            const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
            if (!serviceKey) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: "SUPABASE_SERVICE_ROLE_KEY manquant" }));
            }
            const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
            const { data: { user } } = await userClient.auth.getUser();
            if (!user) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: "Session invalide" }));
            }
            const { data: isAdmin } = await userClient.rpc("is_admin");
            if (!isAdmin) {
              res.statusCode = 403;
              return res.end(JSON.stringify({ error: "R\xE9serv\xE9 aux administrateurs" }));
            }
            const email = String(body.email ?? "").trim().toLowerCase();
            const password = String(body.password ?? "");
            const first_name = String(body.first_name ?? "").trim();
            const last_name = String(body.last_name ?? "").trim();
            const role = String(body.role ?? "");
            if (!email || !password || password.length < 8) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: "Email et mot de passe requis" }));
            }
            const adminClient = createClient(supabaseUrl, serviceKey);
            const roleName = role === "teacher" ? "prof" : role;
            const { data: roleData } = await adminClient.from("user_roles").select("id").eq("role_name", roleName).maybeSingle();
            const roleId = roleData?.id ?? 3;
            const { data: created, error: createError } = await adminClient.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { first_name, last_name, role, created_by_admin: "true" }
            });
            if (createError || !created.user) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: createError?.message ?? "Erreur cr\xE9ation" }));
            }
            const userId = created.user.id;
            await new Promise((resolve) => setTimeout(resolve, 500));
            await adminClient.from("profiles").update({
              role_id: roleId,
              first_name,
              last_name,
              email,
              requested_role: role
            }).eq("user_id", userId);
            res.statusCode = 200;
            return res.end(JSON.stringify({ user_id: userId }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      host: "::",
      port: 8080
    },
    plugins: [
      react(),
      localApiPlugin(env),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            supabase: ["@supabase/supabase-js"],
            charts: ["recharts"],
            query: ["@tanstack/react-query"]
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyYW16aVxcXFxPbmVEcml2ZVxcXFxCdXJlYXVcXFxcaG91c3NlbWFjY2VkbXlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHJhbXppXFxcXE9uZURyaXZlXFxcXEJ1cmVhdVxcXFxob3Vzc2VtYWNjZWRteVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcmFtemkvT25lRHJpdmUvQnVyZWF1L2hvdXNzZW1hY2NlZG15L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIjtcclxuXHJcbmZ1bmN0aW9uIGxvY2FsQXBpUGx1Z2luKGVudikge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnbG9jYWwtYXBpLXBsdWdpbicsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoJy9hcGkvY3JlYXRlLXVzZXInLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdQT1NULCBPUFRJT05TJyk7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdhdXRob3JpemF0aW9uLCBjb250ZW50LXR5cGUnKTtcclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgICAgICByZXR1cm4gcmVzLmVuZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDU7XHJcbiAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTWV0aG9kIG5vdCBhbGxvd2VkJyB9KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYm9keVN0ciA9ICcnO1xyXG4gICAgICAgIHJlcS5vbignZGF0YScsIGNodW5rID0+IHsgYm9keVN0ciArPSBjaHVuay50b1N0cmluZygpOyB9KTtcclxuICAgICAgICByZXEub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBKU09OLnBhcnNlKGJvZHlTdHIpO1xyXG4gICAgICAgICAgICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICAgICAgICAgICAgaWYgKCFhdXRoSGVhZGVyKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDE7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ05vbiBhdXRvcmlzXHUwMEU5JyB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHN1cGFiYXNlVXJsID0gZW52LlZJVEVfU1VQQUJBU0VfVVJMO1xyXG4gICAgICAgICAgICBjb25zdCBhbm9uS2V5ID0gZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlcnZpY2VLZXkgPSBlbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2VydmljZUtleSkge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIG1hbnF1YW50JyB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHVzZXJDbGllbnQgPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIGFub25LZXksIHsgZ2xvYmFsOiB7IGhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogYXV0aEhlYWRlciB9IH0gfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgZGF0YTogeyB1c2VyIH0gfSA9IGF3YWl0IHVzZXJDbGllbnQuYXV0aC5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAgIGlmICghdXNlcikge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAxO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdTZXNzaW9uIGludmFsaWRlJyB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHsgZGF0YTogaXNBZG1pbiB9ID0gYXdhaXQgdXNlckNsaWVudC5ycGMoJ2lzX2FkbWluJyk7XHJcbiAgICAgICAgICAgIGlmICghaXNBZG1pbikge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAzO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdSXHUwMEU5c2Vydlx1MDBFOSBhdXggYWRtaW5pc3RyYXRldXJzJyB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGVtYWlsID0gU3RyaW5nKGJvZHkuZW1haWwgPz8gJycpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXNzd29yZCA9IFN0cmluZyhib2R5LnBhc3N3b3JkID8/ICcnKTtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RfbmFtZSA9IFN0cmluZyhib2R5LmZpcnN0X25hbWUgPz8gJycpLnRyaW0oKTtcclxuICAgICAgICAgICAgY29uc3QgbGFzdF9uYW1lID0gU3RyaW5nKGJvZHkubGFzdF9uYW1lID8/ICcnKS50cmltKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJvbGUgPSBTdHJpbmcoYm9keS5yb2xlID8/ICcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZW1haWwgfHwgIXBhc3N3b3JkIHx8IHBhc3N3b3JkLmxlbmd0aCA8IDgpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnRW1haWwgZXQgbW90IGRlIHBhc3NlIHJlcXVpcycgfSkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhZG1pbkNsaWVudCA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc2VydmljZUtleSk7XHJcblxyXG4gICAgICAgICAgICAvLyBGZXRjaCByb2xlIElEXHJcbiAgICAgICAgICAgIGNvbnN0IHJvbGVOYW1lID0gcm9sZSA9PT0gJ3RlYWNoZXInID8gJ3Byb2YnIDogcm9sZTtcclxuICAgICAgICAgICAgY29uc3QgeyBkYXRhOiByb2xlRGF0YSB9ID0gYXdhaXQgYWRtaW5DbGllbnQuZnJvbSgndXNlcl9yb2xlcycpLnNlbGVjdCgnaWQnKS5lcSgncm9sZV9uYW1lJywgcm9sZU5hbWUpLm1heWJlU2luZ2xlKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJvbGVJZCA9IHJvbGVEYXRhPy5pZCA/PyAzO1xyXG5cclxuICAgICAgICAgICAgLy8gVXNlIGFkbWluIEFQSSAoYnlwYXNzZXMgcmF0ZSBsaW1pdHMpXHJcbiAgICAgICAgICAgIGNvbnN0IHsgZGF0YTogY3JlYXRlZCwgZXJyb3I6IGNyZWF0ZUVycm9yIH0gPSBhd2FpdCBhZG1pbkNsaWVudC5hdXRoLmFkbWluLmNyZWF0ZVVzZXIoe1xyXG4gICAgICAgICAgICAgIGVtYWlsLFxyXG4gICAgICAgICAgICAgIHBhc3N3b3JkLFxyXG4gICAgICAgICAgICAgIGVtYWlsX2NvbmZpcm06IHRydWUsXHJcbiAgICAgICAgICAgICAgdXNlcl9tZXRhZGF0YTogeyBmaXJzdF9uYW1lLCBsYXN0X25hbWUsIHJvbGUsIGNyZWF0ZWRfYnlfYWRtaW46ICd0cnVlJyB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNyZWF0ZUVycm9yIHx8ICFjcmVhdGVkLnVzZXIpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMDtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBjcmVhdGVFcnJvcj8ubWVzc2FnZSA/PyAnRXJyZXVyIGNyXHUwMEU5YXRpb24nIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdXNlcklkID0gY3JlYXRlZC51c2VyLmlkO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdHJpZ2dlciB0byBjcmVhdGUgcHJvZmlsZSwgdGhlbiB1cGRhdGUgaXRcclxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYXdhaXQgYWRtaW5DbGllbnQuZnJvbSgncHJvZmlsZXMnKS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgIHJvbGVfaWQ6IHJvbGVJZCxcclxuICAgICAgICAgICAgICBmaXJzdF9uYW1lLFxyXG4gICAgICAgICAgICAgIGxhc3RfbmFtZSxcclxuICAgICAgICAgICAgICBlbWFpbCxcclxuICAgICAgICAgICAgICByZXF1ZXN0ZWRfcm9sZTogcm9sZVxyXG4gICAgICAgICAgICB9KS5lcSgndXNlcl9pZCcsIHVzZXJJZCk7XHJcblxyXG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyB1c2VyX2lkOiB1c2VySWQgfSkpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB9KSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG4gIHJldHVybiB7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgaG9zdDogXCI6OlwiLFxyXG4gICAgICBwb3J0OiA4MDgwLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgbG9jYWxBcGlQbHVnaW4oZW52KSxcclxuICAgICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxyXG4gICAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGlhczoge1xyXG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICAgc3VwYWJhc2U6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXHJcbiAgICAgICAgICAgIGNoYXJ0czogWydyZWNoYXJ0cyddLFxyXG4gICAgICAgICAgICBxdWVyeTogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxjQUFjLGVBQWU7QUFDM1csT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLG9CQUFvQjtBQUo3QixJQUFNLG1DQUFtQztBQU16QyxTQUFTLGVBQWUsS0FBSztBQUMzQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixnQkFBZ0IsUUFBUTtBQUN0QixhQUFPLFlBQVksSUFBSSxvQkFBb0IsT0FBTyxLQUFLLFFBQVE7QUFDN0QsWUFBSSxVQUFVLGdCQUFnQixr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
