import any from '@travi/any';
import {assert} from 'chai';
import sinon from 'sinon';
import {scaffold} from './language-scaffolder';

suite('language scaffolder', () => {
  test('that the language specific scaffolder is called with necessary data', () => {
    const options = any.simpleObject();
    const chosenLanguage = any.word();
    const chosenLanguageScaffolder = sinon.stub();
    const scaffolderResult = any.simpleObject();
    chosenLanguageScaffolder.withArgs(options).resolves(scaffolderResult);
    const scaffolders = {...any.simpleObject(), [chosenLanguage]: chosenLanguageScaffolder};

    return assert.becomes(scaffold(scaffolders, chosenLanguage, options), scaffolderResult);
  });

  test('that that choosing a language without a defined scaffolder does not result in an error', () => scaffold(
    any.simpleObject(),
    any.word(),
    any.simpleObject()
  ));
});
