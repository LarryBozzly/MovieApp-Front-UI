import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const hash = execSync('git rev-parse --short HEAD').toString().trim();

const version = { version: hash };

const outPath = path.resolve('public/version/version.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(version, null, 2));

console.log('Generated public/version/version.json:', hash);
