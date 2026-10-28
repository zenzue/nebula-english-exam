import { defineConfig } from 'vite-plus';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Vite+ runs `vp dev` directly. Populate process.env for SvelteKit's
// server-only configuration without exposing private keys to the browser.
if (existsSync('.env')) loadEnvFile('.env');
import { sveltekit } from '@sveltejs/kit/vite';

// Additional protection during local development: keep database and answer-key
// files out of Vite's file-serving surface, including /@fs/ traversal attempts.
const denySensitiveFiles = {
  name: 'deny-sensitive-private-files',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      let pathname = '';
      try { pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname).replaceAll('\\', '/'); }
      catch { res.statusCode = 400; res.end(); return; }
      if (/(^|\/)(private|data)(\/|$)/i.test(pathname) || pathname.includes('question-bank.json') || pathname.includes('instructor-answer-key.csv')) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }
      next();
    });
  }
};

export default defineConfig({
  plugins: [denySensitiveFiles, sveltekit()],
  server: { fs: { strict: true, deny: ['**/private/**', '**/data/**', '**/.env', '**/.env.*'] } }
});
