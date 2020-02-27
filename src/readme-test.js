import {promises} from 'fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldReadme from './readme';

const badgeFactory = () => ({img: any.url(), link: any.url(), text: any.sentence()});
const consumerBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const statusBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const contributionBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
const buildBadgeGroup = badgeData => Object.entries(badgeData)
  .map(([name, badge]) => `[![${badge.text}][${name}-badge]][${name}-link]`);

const assertBadgeIncludedInMarkdown = (badgeData, projectRoot) => Object.entries(badgeData).forEach(([name, badge]) => {
  assert.calledWith(
    promises.writeFile,
    `${projectRoot}/README.md`,
    sinon.match(`
[![${badge.text}][${name}-badge]][${name}-link]
`)
  );
  assert.calledWith(
    promises.writeFile,
    `${projectRoot}/README.md`,
    sinon.match(`
[${name}-badge]: ${badge.img}
`)
  );
  assert.calledWith(
    promises.writeFile,
    `${projectRoot}/README.md`,
    sinon.match(`
[${name}-link]: ${badge.link}
`)
  );
});

suite('scaffold readme', () => {
  let sandbox;
  const projectName = any.word();
  const projectRoot = any.word();
  const description = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(promises, 'writeFile');

    promises.writeFile.resolves();
  });

  teardown(() => sandbox.restore());

  test('that the README has a top-level heading of the project name and includes the description', async () => {
    await scaffoldReadme({projectName, projectRoot, description, badges: {consumer: {}, status: {}, contribution: {}}})
      .then(() => assert.calledWith(
        promises.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`# ${projectName}

${description}`)
      ));
  });

  suite('badges', () => {
    test('that the badges and references are generated from the provided data', async () => {
      await scaffoldReadme({
        projectRoot,
        badges: {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges}
      });

      assertBadgeIncludedInMarkdown(consumerBadges, projectRoot);
      assertBadgeIncludedInMarkdown(statusBadges, projectRoot);
      assertBadgeIncludedInMarkdown(contributionBadges, projectRoot);
    });

    test('that badges are separated into consumer, status, and contribution groups', async () => {
      await scaffoldReadme({
        projectName,
        projectRoot,
        description,
        badges: {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges}
      });

      assert.calledWith(
        promises.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!-- status badges -->
${buildBadgeGroup(statusBadges).join('\n')}

<!-- consumer badges -->
${buildBadgeGroup(consumerBadges).join('\n')}

<!-- contribution badges -->
${buildBadgeGroup(contributionBadges).join('\n')}
`)
      );
    });
  });

  suite('documentation', () => {
    const markdownWithBackticksAndForwardSlashes = `\`\`\`sh${any.sentence()}\`\`\`https://any.url`;

    test('that usage docs are shown after the contributing badges', async () => {
      const usageDocs = markdownWithBackticksAndForwardSlashes;

      await scaffoldReadme({
        projectRoot,
        badges: {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges},
        documentation: {usage: usageDocs}
      });

      assert.calledWith(
        promises.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!-- status badges -->
${buildBadgeGroup(statusBadges).join('\n')}

## Usage

<!-- consumer badges -->
${buildBadgeGroup(consumerBadges).join('\n')}

${usageDocs}

<!-- contribution badges -->
${buildBadgeGroup(contributionBadges).join('\n')}
`)
      );
    });

    test('that contribution docs are shown after the contributing badges', async () => {
      const contributingDocs = markdownWithBackticksAndForwardSlashes;

      await scaffoldReadme({
        projectRoot,
        badges: {consumer: consumerBadges, status: statusBadges, contribution: contributionBadges},
        documentation: {contributing: contributingDocs}
      });

      assert.calledWith(
        promises.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!-- status badges -->
${buildBadgeGroup(statusBadges).join('\n')}

<!-- consumer badges -->
${buildBadgeGroup(consumerBadges).join('\n')}

## Contributing

<!-- contribution badges -->
${buildBadgeGroup(contributionBadges).join('\n')}

${contributingDocs}
`)
      );
    });
  });
});
