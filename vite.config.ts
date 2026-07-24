import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createClient } from "@supabase/supabase-js";

function localApiPlugin(env) {
  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/create-user', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let bodyStr = '';
        req.on('data', chunk => { bodyStr += chunk.toString(); });
        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr);
            const authHeader = req.headers.authorization;
            if (!authHeader) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Non autorisé' }));
            }

            const supabaseUrl = env.VITE_SUPABASE_URL;
            const anonKey = env.VITE_SUPABASE_ANON_KEY;
            const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

            if (!serviceKey) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant' }));
            }

            const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
            const { data: { user } } = await userClient.auth.getUser();
            if (!user) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Session invalide' }));
            }

            const { data: isAdmin } = await userClient.rpc('is_admin');
            if (!isAdmin) {
              res.statusCode = 403;
              return res.end(JSON.stringify({ error: 'Réservé aux administrateurs' }));
            }

            const email = String(body.email ?? '').trim().toLowerCase();
            const password = String(body.password ?? '');
            const first_name = String(body.first_name ?? '').trim();
            const last_name = String(body.last_name ?? '').trim();
            const role = String(body.role ?? '');

            if (!email || !password || password.length < 8) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Email et mot de passe requis' }));
            }

            const adminClient = createClient(supabaseUrl, serviceKey);

            // Fetch role ID
            const roleName = role === 'teacher' ? 'prof' : role;
            const { data: roleData } = await adminClient.from('user_roles').select('id').eq('role_name', roleName).maybeSingle();
            const roleId = roleData?.id ?? 3;

            // Use admin API (bypasses rate limits)
            const { data: created, error: createError } = await adminClient.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { first_name, last_name, role, created_by_admin: 'true' }
            });

            if (createError || !created.user) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: createError?.message ?? 'Erreur création' }));
            }

            const userId = created.user.id;
            
            // Wait for trigger to create profile, then update it
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await adminClient.from('profiles').update({
              role_id: roleId,
              first_name,
              last_name,
              email,
              requested_role: role
            }).eq('user_id', userId);

            res.statusCode = 200;
            return res.end(JSON.stringify({ user_id: userId }));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      localApiPlugin(env),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            charts: ['recharts'],
            query: ['@tanstack/react-query'],
          },
        },
      },
    },
  };
});
