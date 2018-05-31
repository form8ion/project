import any from '@travi/any';
import {assert} from 'chai';
import {validate} from '../../src/options-validator';

suite('options validator', () => {
  test('that undefined options is allowed', () => assert.deepEqual(validate(), {}));

  test('that empty options is allowed', () => {
    const emptyOptions = {};

    assert.deepEqual(validate(emptyOptions), emptyOptions);
  });

  test('that validated options are returned', () => {
    const options = {
      languages: any.objectWithKeys(any.listOf(any.string), {factory: () => foo => foo}),
      overrides: {
        githubAccount: any.string(),
        copyrightHolder: any.string()
      }
    };

    assert.deepEqual(validate(options), options);
  });

  test('that a provided language must provide a scaffold function', () => {
    const key = any.word();

    assert.throws(
      () => validate({languages: {[key]: any.word()}}),
      `child "languages" fails because [child "${key}" fails because ["${key}" must be a Function]]`
    );
  });

  test('that a provided language scaffolder must accept a single argument', () => {
    const key = any.word();

    assert.throws(
      () => validate({languages: {[key]: () => undefined}}),
      `child "languages" fails because [child "${key}" fails because ["${key}" must have an arity of 1]]`
    );
  });

  test('that the copyright-holder must be a string, when provided', () => {
    assert.throws(
      () => validate({overrides: {copyrightHolder: any.integer()}}),
      'child "overrides" fails because [child "copyrightHolder" fails because ["copyrightHolder" must be a string]]'
    );
  });

  test('that the copyright-holder must be a string, when provided', () => {
    assert.throws(
      () => validate({overrides: {githubAccount: any.integer()}}),
      'child "overrides" fails because [child "githubAccount" fails because ["githubAccount" must be a string]]'
    );
  });
});
