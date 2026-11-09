// sharp is no direct dependency, resolve the copy that ships with Next
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export const sharp = createRequire(require.resolve('next/package.json'))(
  'sharp',
);
