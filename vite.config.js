import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import handler, { setLocalStoreAdapter } from './api/router.js';
import { seedCars } from './src/data.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(root, 'data', 'store.json');
function apiPlugin() {
  let io;
  return {
    name: 'family-auto-api',
    configResolved(config) { Object.assign(process.env, loadEnv(config.mode, root, '')); },
    configureServer(server) {
      setLocalStoreAdapter({
        async read() { try { return JSON.parse(await readFile(storePath,'utf8')); } catch(error) { if(error.code !== 'ENOENT') throw error; return { cars: structuredClone(seedCars) }; } },
        async write(store) { await mkdir(path.dirname(storePath),{recursive:true}); await writeFile(storePath+'.tmp',JSON.stringify(store,null,2)); await rename(storePath+'.tmp',storePath); },
      });
      io = new Server(server.httpServer);
      server.middlewares.use(async (req,res,next) => {
        if (!req.url.startsWith('/api/')) return next();
        res.status = code => { res.statusCode = code; return res; };
        res.json = data => { res.end(JSON.stringify(data)); return res; };
        try {
          if (!['GET','HEAD'].includes(req.method)) {
            let body = ''; for await(const chunk of req) { body += chunk; if(body.length > 1000000) { res.status(413).json({error:'Слишком большой запрос'}); return; } }
            req.body = body ? JSON.parse(body) : {};
          }
          await handler(req,res);
          if (res.statusCode < 300 && !['GET','HEAD'].includes(req.method)) {
            if(req.url.startsWith('/api/cars')) io.emit('cars:changed');
            if(req.url.startsWith('/api/reviews')) io.emit('reviews:changed');
          }
        } catch(error) { console.error(error); if(!res.writableEnded) res.status(400).json({error:'Не удалось обработать запрос'}); }
      });
    },
    closeBundle() { io?.close(); },
  };
}
export default defineConfig({ plugins: [react(), apiPlugin()] });
