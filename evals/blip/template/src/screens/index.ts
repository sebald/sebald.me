import type { ComponentType } from 'react';

import { Camp } from './camp';

/** The screens by name: `?screen=<name>` opens one */
export const screens: Record<string, ComponentType> = {
  camp: Camp,
};
