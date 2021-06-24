import {promises as fs} from 'fs';
import any from '@travi/any';
import * as readme from '@form8ion/readme';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldReadme from './readme.js';

const badgeFactory = () => ({img: any.url(), link: any.url(), text: any.sentence()});
const consumerBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const statusBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const contributionBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});

suite('scaffold readme', () => {
  let sandbox;
  const projectName = any.word();
  const projectRoot = any.word();
  const description = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(readme, 'lift');
    sandbox.stub(fs, 'writeFile');
  });

  teardown(() => sandbox.restore());

  test('that the README has a top-level heading of the project name and includes the description', async () => {
    const badges = {consumer: {}, status: {}, contribution: {}};

    await scaffoldReadme({projectName, projectRoot, description, badges});

    assert.calledWith(
      fs.writeFile,
      `${projectRoot}/README.md`,
      sinon.match(`# ${projectName}

${description}`)
    );
    assert.calledWith(readme.lift, {projectRoot, results: {badges}});
  });

  suite('documentation', () => {
    const markdownWithBackticksAndForwardSlashes = `\`\`\`sh${any.sentence()}\`\`\`https://any.url`;

    test('that usage docs are shown after the contributing badges', async () => {
      const usageDocs = markdownWithBackticksAndForwardSlashes;
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};

      await scaffoldReadme({
        projectRoot,
        badges,
        documentation: {usage: usageDocs}
      });

      assert.calledWith(
        fs.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

## Usage

<!--consumer-badges start -->
<!--consumer-badges end -->

${usageDocs}

<!--contribution-badges start -->
<!--contribution-badges end -->
`)
      );
    });

    test('that consumer badges are lifted to top level when toc is present and no usage content', async () => {
      const toc = `${any.word()} \`${any.word()}\` ${any.word()}`;
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};

      await scaffoldReadme({
        projectRoot,
        badges,
        documentation: {toc}
      });

      assert.calledWith(
        fs.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

<!--consumer-badges start -->
<!--consumer-badges end -->

## Table of Contents

${toc}

<!--contribution-badges start -->
<!--contribution-badges end -->
`)
      );
    });

    test('that contribution docs are shown after the contributing badges', async () => {
      const contributingDocs = markdownWithBackticksAndForwardSlashes;
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};

      await scaffoldReadme({
        projectRoot,
        badges,
        documentation: {contributing: contributingDocs}
      });

      assert.calledWith(
        fs.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

<!--consumer-badges start -->
<!--consumer-badges end -->

## Contributing

<!--contribution-badges start -->
<!--contribution-badges end -->

${contributingDocs}
`)
      );
    });
  });
});
