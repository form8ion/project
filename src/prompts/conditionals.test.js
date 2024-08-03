import {describe, expect, it} from 'vitest';
import any from '@travi/any';

import {questionNames} from './question-names.js';
import {
  copyrightInformationShouldBeRequested,
  licenseChoicesShouldBePresented,
  unlicensedConfirmationShouldBePresented
} from './conditionals.js';

describe('prompt conditionals', () => {
  describe('unlicensed confirmation', () => {
    it('should show the unlicensed confirmation for a private project', () => {
      expect(unlicensedConfirmationShouldBePresented({[questionNames.VISIBILITY]: 'Private'})).toBe(true);
    });

    it('should not show the unlicensed confirmation for a public project', () => {
      expect(unlicensedConfirmationShouldBePresented({[questionNames.VISIBILITY]: 'Public'})).toBe(false);
    });
  });

  describe('license choices', () => {
    it('should show the license choices for a public project', () => {
      expect(licenseChoicesShouldBePresented({[questionNames.VISIBILITY]: 'Public'})).toBe(true);
    });

    it('should show the license choices for a private project that is not unlicensed', () => {
      expect(licenseChoicesShouldBePresented({
        [questionNames.VISIBILITY]: 'Private',
        [questionNames.UNLICENSED]: false
      })).toBe(true);
    });

    it('should not show the license choices for a private project that is unlicensed', () => {
      expect(licenseChoicesShouldBePresented({
        [questionNames.VISIBILITY]: 'Private',
        [questionNames.UNLICENSED]: true
      })).toBe(false);
    });
  });

  describe('copyright', () => {
    it('should request the copyright information when the project is licensed', () => {
      expect(copyrightInformationShouldBeRequested({[questionNames.LICENSE]: any.string()})).toBe(true);
    });

    it('should not request the copyright information when the project is not licensed', () => {
      expect(copyrightInformationShouldBeRequested({[questionNames.LICENSE]: undefined})).toBe(false);
    });
  });
});
