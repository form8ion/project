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
      overrides: {copyrightHolder: any.string()},
      vcsHosts: any.objectWithKeys(
        any.listOf(any.string),
        {factory: () => ({scaffolder: foo => foo, prompt: () => undefined})}
      )
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

  test('that a provided vcs-host must define options as an object', () => {
    const key = any.word();

    assert.throws(
      () => validate({vcsHosts: {[key]: []}}),
      `child "vcsHosts" fails because [child "${key}" fails because ["${key}" must be an object]]`
    );
  });

  test('that a provided vcs-host must provide a scaffold function', () => {
    const key = any.word();

    assert.throws(
      () => validate({vcsHosts: {[key]: {}}}),
      `child "vcsHosts" fails because [child "${key}" fails because ` +
      '[child "scaffolder" fails because ["scaffolder" is required]]]'
    );
  });

  test('that a provided vcs-host scaffolder must accept a single argument', () => {
    const key = any.word();

    assert.throws(
      () => validate({vcsHosts: {[key]: {scaffolder: () => undefined}}}),
      `child "vcsHosts" fails because [child "${key}" fails because ` +
      '[child "scaffolder" fails because ["scaffolder" must have an arity of 1]]]'
    );
  });

  test('that a provided vcs-host must provide a prompt function', () => {
    const key = any.word();

    assert.throws(
      () => validate({vcsHosts: {[key]: {scaffolder: foo => foo}}}),
      `child "vcsHosts" fails because [child "${key}" fails because ` +
      '[child "prompt" fails because ["prompt" is required]]]'
    );
  });
});
