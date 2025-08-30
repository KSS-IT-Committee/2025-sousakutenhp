// src/scripts/generate-robots.mjs
import 'dotenv/config'; // <--- これでローカルの .env を読み込みます
import fs from 'fs';
import path from 'path';

const policy = (process.env.ROBOTS_POLICY || 'allow').trim();

const robotsContent = policy === 'disallow'
  ? `User-agent: *
Disallow: /`
  : `User-agent: *
Allow: /`;

// public ディレクトリを作って書き込む
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf8');
console.log('WROTES public/robots.txt ->', policy);

// 同じポリシーを Astro 側で使いたいときのために生成モジュールも作る
const genDir = path.resolve(process.cwd(), 'src', 'generated');
if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });

const genFile = `export const ROBOTS_POLICY = ${JSON.stringify(policy)};\n`;
fs.writeFileSync(path.join(genDir, 'robots.js'), genFile, 'utf8');
console.log('WROTES src/generated/robots.js ->', policy);
