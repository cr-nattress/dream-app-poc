import fs from 'node:fs/promises';
import path from 'node:path';

export const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function readFileUtf8(p: string) {
  return fs.readFile(p, 'utf8');
}

export function joinContentPath(...segments: string[]) {
  return path.join(CONTENT_DIR, ...segments);
}

export async function listMarkdownFiles(dir: string): Promise<string[]> {
  const full = joinContentPath(dir);
  const all = await fs.readdir(full, { withFileTypes: true });
  const files: string[] = [];
  for (const e of all) {
    if (e.isDirectory()) {
      files.push(...(await listMarkdownFiles(path.join(dir, e.name))));
    } else if (e.isFile() && e.name.endsWith('.md')) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}
