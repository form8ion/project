import fs from 'fs';
import badgeInjectorPlugin from '@form8ion/remark-inject-badges';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import * as remark from '../thirdparty-wrappers/remark';
import scaffoldReadme from './readme';

const badgeFactory = () => ({img: any.url(), link: any.url(), text: any.sentence()});
const consumerBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const statusBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const contributionBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});

suite('scaffold readme', () => {
  let sandbox, use, remarkProcess;
  const projectName = any.word();
  const projectRoot = any.word();
  const description = any.word();
  const remarkResults = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(remark, 'default');
    sandbox.stub(fs, 'writeFileSync');

    use = sinon.stub();
    remarkProcess = sinon.stub();

    remark.default.returns({use});
  });

  teardown(() => sandbox.restore());

  test('that the README has a top-level heading of the project name and includes the description', async () => {
    const badges = {consumer: {}, status: {}, contribution: {}};
    use.withArgs(badgeInjectorPlugin, badges).returns({process: remarkProcess});
    remarkProcess
      .withArgs(sinon.match(`# ${projectName}

${description}`))
      .yields(null, remarkResults);

    await scaffoldReadme({projectName, projectRoot, description, badges});

    assert.calledWith(fs.writeFileSync, `${projectRoot}/README.md`, remarkResults);
  });

  test('that the promise is rejected if there is a processing failure', () => {
    const error = new Error('from test');
    use.returns({process: remarkProcess});
    remarkProcess.yields(error);

    return assert.isRejected(scaffoldReadme({projectName, projectRoot, description}), error)
      .then(() => assert.notCalled(fs.writeFileSync));
  });

  suite('badges', () => {
    test('that badges are separated into consumer, status, and contribution zones', async () => {
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};
      use.withArgs(badgeInjectorPlugin, badges).returns({process: remarkProcess});
      remarkProcess
        .withArgs(sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

<!--consumer-badges start -->
<!--consumer-badges end -->

<!--contribution-badges start -->
<!--contribution-badges end -->
`))
        .yields(null, remarkResults);

      await scaffoldReadme({projectName, projectRoot, description, badges});

      assert.calledWith(fs.writeFileSync, `${projectRoot}/README.md`, remarkResults);
    });
  });

  suite('documentation', () => {
    const markdownWithBackticksAndForwardSlashes = `\`\`\`sh${any.sentence()}\`\`\`https://any.url`;

    test('that usage docs are shown after the contributing badges', async () => {
      const usageDocs = markdownWithBackticksAndForwardSlashes;
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};
      use.withArgs(badgeInjectorPlugin, badges).returns({process: remarkProcess});
      remarkProcess
        .withArgs(sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

## Usage

<!--consumer-badges start -->
<!--consumer-badges end -->

${usageDocs}

<!--contribution-badges start -->
<!--contribution-badges end -->
`))
        .yields(null, remarkResults);

      await scaffoldReadme({
        projectRoot,
        badges,
        documentation: {usage: usageDocs}
      });

      assert.calledWith(fs.writeFileSync, `${projectRoot}/README.md`, remarkResults);
    });

    test('that consumer badges are lifted to top level when toc is present and no usage content', async () => {
      const toc = any.word();
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};
      use.withArgs(badgeInjectorPlugin, badges).returns({process: remarkProcess});
      remarkProcess
        .withArgs(sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

<!--consumer-badges start -->
<!--consumer-badges end -->

## Table of Contents

${toc}

<!--contribution-badges start -->
<!--contribution-badges end -->
`))
        .yields(null, remarkResults);

      await scaffoldReadme({
        projectRoot,
        badges,
        documentation: {toc}
      });

      assert.calledWith(fs.writeFileSync, `${projectRoot}/README.md`, remarkResults);
    });

    test('that contribution docs are shown after the contributing badges', async () => {
      const contributingDocs = markdownWithBackticksAndForwardSlashes;
      const badges = {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges};
      use.withArgs(badgeInjectorPlugin, badges).returns({process: remarkProcess});
      remarkProcess
        .withArgs(sinon.match(`
<!--status-badges start -->
<!--status-badges end -->

<!--consumer-badges start -->
<!--consumer-badges end -->

## Contributing

<!--contribution-badges start -->
<!--contribution-badges end -->

${contributingDocs}
`))
        .yields(null, remarkResults);

      await scaffoldReadme({
        projectRoot,
        badges,
        documentation: {contributing: contributingDocs}
      });

      assert.calledWith(fs.writeFileSync, `${projectRoot}/README.md`, remarkResults);
    });
  });
});
