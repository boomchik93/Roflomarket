#!/usr/bin/env node
// PostToolUse hook: formats and lints the file that was just edited.
// Exit code 2 sends stderr back to Claude, so it fixes the problem right away.
// A missing toolchain (no Go, eslint not installed yet) is skipped silently.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const file = input.tool_response?.filePath ?? input.tool_input?.file_path;
if (!file || !existsSync(file)) process.exit(0);

const abs = resolve(file);
const fromRoot = relative(root, abs);
if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) process.exit(0);

function findUp(marker) {
  for (let dir = dirname(abs); ; dir = dirname(dir)) {
    if (existsSync(join(dir, marker))) return dir;
    if (dir === root || dir === dirname(dir)) return null;
  }
}

function run(command, args, cwd) {
  try {
    execFileSync(command, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    process.stderr.write(`${command} ${args.join(' ')}\n${error.stdout ?? ''}${error.stderr ?? ''}`);
    process.exit(2);
  }
}

const ext = extname(abs);

if (ext === '.go') {
  const moduleDir = findUp('go.mod');
  if (!moduleDir) process.exit(0);
  run('gofmt', ['-w', abs], moduleDir);
  const packagePath = relative(moduleDir, dirname(abs)).split(sep).join('/');
  run('go', ['vet', `./${packagePath}`], moduleDir);
} else if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
  const packageDir = findUp('package.json');
  const eslint = join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!packageDir || !existsSync(eslint)) process.exit(0);
  run(process.execPath, [eslint, '--fix', abs], packageDir);
} else if (ext === '.proto') {
  const bufDir = findUp('buf.yaml');
  if (bufDir) run('buf', ['lint'], bufDir);
}
