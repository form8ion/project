import {resolve} from 'path';
import any from '@travi/any';
import {assert} from 'chai';
import determinePathToTemplateFile from './template-path';

suite('path to templates', () => {
  test('that the proper path to a template file is provided', () => {
    const fileName = any.string();

    assert.equal(determinePathToTemplateFile(fileName), resolve(__dirname, '..', 'templates', fileName));
  });
});
