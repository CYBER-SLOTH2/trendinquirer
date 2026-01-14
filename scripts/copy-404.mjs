import { copyFile, access } from 'fs/promises';
import { constants } from 'fs';
import { resolve } from 'path';

async function main() {
  const root = process.cwd();
  const src = resolve(root, 'dist', '404', 'index.html');
  const dest = resolve(root, 'dist', '404.html');

  try {
    await access(src, constants.R_OK);
  } catch (err) {
    console.warn('No generated 404 page found to copy:', src);
    return;
  }

  try {
    await copyFile(src, dest);
    console.log('Copied', src, '→', dest);
  } catch (err) {
    console.error('Failed to copy 404 page:', err);
    process.exitCode = 2;
  }
}

main();
