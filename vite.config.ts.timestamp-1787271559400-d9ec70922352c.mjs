// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/Admin/Desktop/Rupture-de-collaboration-Houssem-Academy/01-CODE-SOURCE/houssem-academy/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Admin/Desktop/Rupture-de-collaboration-Houssem-Academy/01-CODE-SOURCE/houssem-academy/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { createClient } from "file:///C:/Users/Admin/Desktop/Rupture-de-collaboration-Houssem-Academy/01-CODE-SOURCE/houssem-academy/node_modules/@supabase/supabase-js/dist/main/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\Desktop\\Rupture-de-collaboration-Houssem-Academy\\01-CODE-SOURCE\\houssem-academy";
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
      localApiPlugin(env)
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEZXNrdG9wXFxcXFJ1cHR1cmUtZGUtY29sbGFib3JhdGlvbi1Ib3Vzc2VtLUFjYWRlbXlcXFxcMDEtQ09ERS1TT1VSQ0VcXFxcaG91c3NlbS1hY2FkZW15XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEZXNrdG9wXFxcXFJ1cHR1cmUtZGUtY29sbGFib3JhdGlvbi1Ib3Vzc2VtLUFjYWRlbXlcXFxcMDEtQ09ERS1TT1VSQ0VcXFxcaG91c3NlbS1hY2FkZW15XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbi9EZXNrdG9wL1J1cHR1cmUtZGUtY29sbGFib3JhdGlvbi1Ib3Vzc2VtLUFjYWRlbXkvMDEtQ09ERS1TT1VSQ0UvaG91c3NlbS1hY2FkZW15L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiO1xyXG5cclxuZnVuY3Rpb24gbG9jYWxBcGlQbHVnaW4oZW52KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdsb2NhbC1hcGktcGx1Z2luJyxcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9jcmVhdGUtdXNlcicsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ1BPU1QsIE9QVElPTlMnKTtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJywgJ2F1dGhvcml6YXRpb24sIGNvbnRlbnQtdHlwZScpO1xyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcclxuICAgICAgICAgIHJldHVybiByZXMuZW5kKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XHJcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNTtcclxuICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBib2R5U3RyID0gJyc7XHJcbiAgICAgICAgcmVxLm9uKCdkYXRhJywgY2h1bmsgPT4geyBib2R5U3RyICs9IGNodW5rLnRvU3RyaW5nKCk7IH0pO1xyXG4gICAgICAgIHJlcS5vbignZW5kJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgYm9keSA9IEpTT04ucGFyc2UoYm9keVN0cik7XHJcbiAgICAgICAgICAgIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVycy5hdXRob3JpemF0aW9uO1xyXG4gICAgICAgICAgICBpZiAoIWF1dGhIZWFkZXIpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMTtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTm9uIGF1dG9yaXNcdTAwRTknIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgc3VwYWJhc2VVcmwgPSBlbnYuVklURV9TVVBBQkFTRV9VUkw7XHJcbiAgICAgICAgICAgIGNvbnN0IGFub25LZXkgPSBlbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWTtcclxuICAgICAgICAgICAgY29uc3Qgc2VydmljZUtleSA9IGVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzZXJ2aWNlS2V5KSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1NVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgbWFucXVhbnQnIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdXNlckNsaWVudCA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgYW5vbktleSwgeyBnbG9iYWw6IHsgaGVhZGVyczogeyBBdXRob3JpemF0aW9uOiBhdXRoSGVhZGVyIH0gfSB9KTtcclxuICAgICAgICAgICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgdXNlckNsaWVudC5hdXRoLmdldFVzZXIoKTtcclxuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDE7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1Nlc3Npb24gaW52YWxpZGUnIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgeyBkYXRhOiBpc0FkbWluIH0gPSBhd2FpdCB1c2VyQ2xpZW50LnJwYygnaXNfYWRtaW4nKTtcclxuICAgICAgICAgICAgaWYgKCFpc0FkbWluKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDM7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ1JcdTAwRTlzZXJ2XHUwMEU5IGF1eCBhZG1pbmlzdHJhdGV1cnMnIH0pKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZW1haWwgPSBTdHJpbmcoYm9keS5lbWFpbCA/PyAnJykudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhc3N3b3JkID0gU3RyaW5nKGJvZHkucGFzc3dvcmQgPz8gJycpO1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdF9uYW1lID0gU3RyaW5nKGJvZHkuZmlyc3RfbmFtZSA/PyAnJykudHJpbSgpO1xyXG4gICAgICAgICAgICBjb25zdCBsYXN0X25hbWUgPSBTdHJpbmcoYm9keS5sYXN0X25hbWUgPz8gJycpLnRyaW0oKTtcclxuICAgICAgICAgICAgY29uc3Qgcm9sZSA9IFN0cmluZyhib2R5LnJvbGUgPz8gJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgcGFzc3dvcmQubGVuZ3RoIDwgOCkge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdFbWFpbCBldCBtb3QgZGUgcGFzc2UgcmVxdWlzJyB9KSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFkbWluQ2xpZW50ID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzZXJ2aWNlS2V5KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZldGNoIHJvbGUgSURcclxuICAgICAgICAgICAgY29uc3Qgcm9sZU5hbWUgPSByb2xlID09PSAndGVhY2hlcicgPyAncHJvZicgOiByb2xlO1xyXG4gICAgICAgICAgICBjb25zdCB7IGRhdGE6IHJvbGVEYXRhIH0gPSBhd2FpdCBhZG1pbkNsaWVudC5mcm9tKCd1c2VyX3JvbGVzJykuc2VsZWN0KCdpZCcpLmVxKCdyb2xlX25hbWUnLCByb2xlTmFtZSkubWF5YmVTaW5nbGUoKTtcclxuICAgICAgICAgICAgY29uc3Qgcm9sZUlkID0gcm9sZURhdGE/LmlkID8/IDM7XHJcblxyXG4gICAgICAgICAgICAvLyBVc2UgYWRtaW4gQVBJIChieXBhc3NlcyByYXRlIGxpbWl0cylcclxuICAgICAgICAgICAgY29uc3QgeyBkYXRhOiBjcmVhdGVkLCBlcnJvcjogY3JlYXRlRXJyb3IgfSA9IGF3YWl0IGFkbWluQ2xpZW50LmF1dGguYWRtaW4uY3JlYXRlVXNlcih7XHJcbiAgICAgICAgICAgICAgZW1haWwsXHJcbiAgICAgICAgICAgICAgcGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgZW1haWxfY29uZmlybTogdHJ1ZSxcclxuICAgICAgICAgICAgICB1c2VyX21ldGFkYXRhOiB7IGZpcnN0X25hbWUsIGxhc3RfbmFtZSwgcm9sZSwgY3JlYXRlZF9ieV9hZG1pbjogJ3RydWUnIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3JlYXRlRXJyb3IgfHwgIWNyZWF0ZWQudXNlcikge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGNyZWF0ZUVycm9yPy5tZXNzYWdlID8/ICdFcnJldXIgY3JcdTAwRTlhdGlvbicgfSkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1c2VySWQgPSBjcmVhdGVkLnVzZXIuaWQ7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0cmlnZ2VyIHRvIGNyZWF0ZSBwcm9maWxlLCB0aGVuIHVwZGF0ZSBpdFxyXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBhd2FpdCBhZG1pbkNsaWVudC5mcm9tKCdwcm9maWxlcycpLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgcm9sZV9pZDogcm9sZUlkLFxyXG4gICAgICAgICAgICAgIGZpcnN0X25hbWUsXHJcbiAgICAgICAgICAgICAgbGFzdF9uYW1lLFxyXG4gICAgICAgICAgICAgIGVtYWlsLFxyXG4gICAgICAgICAgICAgIHJlcXVlc3RlZF9yb2xlOiByb2xlXHJcbiAgICAgICAgICAgIH0pLmVxKCd1c2VyX2lkJywgdXNlcklkKTtcclxuXHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHVzZXJfaWQ6IHVzZXJJZCB9KSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGVyci5tZXNzYWdlIH0pKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiBcIjo6XCIsXHJcbiAgICAgIHBvcnQ6IDgwODAsXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICByZWFjdCgpLFxyXG4gICAgICBsb2NhbEFwaVBsdWdpbihlbnYpLFxyXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgICBzdXBhYmFzZTogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcclxuICAgICAgICAgICAgY2hhcnRzOiBbJ3JlY2hhcnRzJ10sXHJcbiAgICAgICAgICAgIHF1ZXJ5OiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9O1xyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwZCxTQUFTLGNBQWMsZUFBZTtBQUNoZ0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUg3QixJQUFNLG1DQUFtQztBQUt6QyxTQUFTLGVBQWUsS0FBSztBQUMzQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixnQkFBZ0IsUUFBUTtBQUN0QixhQUFPLFlBQVksSUFBSSxvQkFBb0IsT0FBTyxLQUFLLFFBQVE7QUFDN0Qs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
