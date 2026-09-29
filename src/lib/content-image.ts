import { createHash } from 'node:crypto';

/**
 * Short hash of an image's content. Content image URLs carry it as `?v=`, so a
 * changed image gets a new URL and every cache can keep the old one forever.
 */
export const imageVersion = (data: Uint8Array) =>
  createHash('sha256').update(data).digest('hex').slice(0, 8);
