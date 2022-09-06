import {Separator} from '@form8ion/overridable-prompts';

import {assert} from 'chai';
import any from '@travi/any';

import {questionNames} from './question-names';
import {
  unlicensedConfirmationShouldBePresented,
  licenseChoicesShouldBePresented,
  copyrightInformationShouldBeRequested,
  filterChoicesByVisibility
} from './conditionals';

suite('prompt conditionals', () => {
  suite('unlicensed confirmation', () => {
    test('that the unlicensed confirmation is shown for a private project', () => {
      assert.isTrue(unlicensedConfirmationShouldBePresented({[questionNames.VISIBILITY]: 'Private'}));
    });

    test('that the unlicensed confirmation is not shown for a public project', () => {
      assert.isFalse(unlicensedConfirmationShouldBePresented({[questionNames.VISIBILITY]: 'Public'}));
    });
  });

  suite('license choices', () => {
    test('that the license choices are shown for a public project', () => {
      assert.isTrue(licenseChoicesShouldBePresented({[questionNames.VISIBILITY]: 'Public'}));
    });

    test('that the license choices are shown for a private project that is not unlicensed', () => {
      assert.isTrue(licenseChoicesShouldBePresented({
        [questionNames.VISIBILITY]: 'Private',
        [questionNames.UNLICENSED]: false
      }));
    });

    test('that the license choices are not shown for a private project that is unlicensed', () => {
      assert.isFalse(licenseChoicesShouldBePresented({
        [questionNames.VISIBILITY]: 'Private',
        [questionNames.UNLICENSED]: true
      }));
    });
  });

  suite('copyright', () => {
    test('that the copyright information is requested when the project is licensed', () => {
      assert.isTrue(copyrightInformationShouldBeRequested({
        [questionNames.LICENSE]: any.string()
      }));
    });

    test('that the copyright information is not requested when the project is not licensed', () => {
      assert.isFalse(copyrightInformationShouldBeRequested({
        [questionNames.LICENSE]: undefined
      }));
    });
  });

  suite('choices by project visibility', () => {
    const publicChoices = any.objectWithKeys(
      any.listOf(any.word),
      {factory: () => ({...any.simpleObject(), public: true})}
    );
    const privateChoices = any.objectWithKeys(
      any.listOf(any.word),
      {factory: () => ({...any.simpleObject(), private: true})}
    );
    const choices = {...publicChoices, ...privateChoices};

    test('that the public hosts are listed for `Public` projects', () => {
      assert.deepEqual(
        filterChoicesByVisibility(choices, 'Public'),
        [...Object.keys(publicChoices), new Separator(), 'Other']
      );
    });

    test('that the private hosts are listed for `Private` projects', () => {
      assert.deepEqual(
        filterChoicesByVisibility(choices, 'Private'),
        [...Object.keys(privateChoices), new Separator(), 'Other']
      );
    });
  });
});
