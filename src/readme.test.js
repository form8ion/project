import * as readme from '@form8ion/readme';

import {afterEach, describe, expect, it, vi} from 'vitest';
import any from '@travi/any';

import scaffoldReadme from './readme.js';

vi.mock('@form8ion/readme');

describe('readme', () => {
  const projectName = any.word();
  const projectRoot = any.word();
  const description = any.word();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create and lift the README', async () => {
    const badges = any.simpleObject();
    const documentation = any.simpleObject();

    await scaffoldReadme({projectName, projectRoot, description, badges, documentation});

    expect(readme.scaffold).toHaveBeenCalledWith({projectRoot, projectName, description});
    expect(readme.lift).toHaveBeenCalledWith({projectRoot, results: {badges, documentation}});
  });
});
