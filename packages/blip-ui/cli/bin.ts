#!/usr/bin/env node
import { findDocsDir } from './docs-dir.ts';
import { run } from './run.ts';

process.exitCode = run(process.argv.slice(2), {
  docsDir: findDocsDir(),
  cwd: process.cwd(),
  env: process.env,
  out: text => console.log(text),
  err: text => console.error(text),
});
