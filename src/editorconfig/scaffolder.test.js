import {promises as fs} from 'node:fs';
import {resolve} from 'node:path';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import scaffoldEditorconfig from './scaffolder.js';

vi.mock('fs');

describe('editorconfig scaffolder', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the config file', async () => {
    const projectRoot = any.string();

    await scaffoldEditorconfig({projectRoot});

    expect(fs.copyFile).toHaveBeenCalledWith(
      resolve(__dirname, '..', '..', 'templates', 'editorconfig.ini'),
      `${projectRoot}/.editorconfig`
    );
  });
});
