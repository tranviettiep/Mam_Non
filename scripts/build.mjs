import { execSync } from 'node:child_process';
import fs from 'node:fs';

function cleanRootPwaCopies() {
  fs.rmSync('manifest.webmanifest', { force: true });
  fs.rmSync('sw.js', { force: true });
  fs.rmSync('icons', { recursive: true, force: true });
}

function syncRootPwaCopies() {
  fs.copyFileSync('public/sw.js', 'sw.js');
  fs.copyFileSync('public/.nojekyll', '.nojekyll');
  fs.cpSync('public/icons', 'icons', { recursive: true, force: true });

  const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'));
  const rootManifest = {
    ...manifest,
    start_url: './San_Choi_Chu_Cai.html',
  };
  fs.writeFileSync('manifest.webmanifest', JSON.stringify(rootManifest, null, 2) + '\n', 'utf8');
}

cleanRootPwaCopies();
try {
  execSync('npx tsc -b', { stdio: 'inherit' });
  execSync('npx vite build', { stdio: 'inherit' });
  fs.copyFileSync('dist/index.html', 'public/standalone-template.html');
  fs.copyFileSync('dist/index.html', 'San_Choi_Chu_Cai.html');
} finally {
  syncRootPwaCopies();
}
