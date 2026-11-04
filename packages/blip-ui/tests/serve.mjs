/**
 * Serves the built Storybook (`storybook-static`) for the visual tests,
 * without another dependency: `node tests/serve.mjs <port>`
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'storybook-static');
const PORT = Number(process.argv[2] ?? 6106);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  const path = normalize(
    decodeURIComponent(new URL(req.url, 'http://x').pathname),
  );
  let file = join(ROOT, path);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory())
    file = join(file, 'index.html');
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Storybook on http://localhost:${PORT}`));
