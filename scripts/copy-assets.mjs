import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist/src/desktop', { recursive: true });
for (const name of ['index.html', 'renderer.js']) await copyFile(`src/desktop/${name}`, `dist/src/desktop/${name}`);
