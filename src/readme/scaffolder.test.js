import * as readme from '@form8ion/readme';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import scaffoldReadme from './scaffolder.js';

vi.mock('@form8ion/readme');

describe('readme scaffolder', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the README', async () => {
    const projectName = any.word();
    const projectRoot = any.word();
    const description = any.word();

    await scaffoldReadme({projectRoot, projectName, description});

    expect(readme.scaffold).toHaveBeenCalledWith({projectRoot, projectName, description});
  });
});
