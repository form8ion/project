import fs from 'mz/fs';
import any from '@travi/any';
import sinon from 'sinon';
import {assert} from 'chai';
import scaffoldReadme from '../../src/readme';

const assertBadgeIncludedInMarkdown = (badgeData, projectRoot) => Object.entries(badgeData).forEach(([name, badge]) => {
  assert.calledWith(
    fs.writeFile,
    `${projectRoot}/README.md`,
    sinon.match(`
[![${badge.text}][${name}-badge]][${name}-link]
`)
  );
  assert.calledWith(
    fs.writeFile,
    `${projectRoot}/README.md`,
    sinon.match(`
[${name}-badge]: ${badge.img}
`)
  );
  assert.calledWith(
    fs.writeFile,
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
    sandbox = sinon.sandbox.create();

    sandbox.stub(fs, 'writeFile');

    fs.writeFile.resolves();
  });

  teardown(() => sandbox.restore());

  test('that the README has a top-level heading of the project name and includes the description', async () => {
    await scaffoldReadme({projectName, projectRoot, description, badges: {consumer: {}, status: {}, contribution: {}}})
      .then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`# ${projectName}

${description}`)
      ));
  });

  suite('badges', () => {
    const badgeFactory = () => ({img: any.url(), link: any.url(), text: any.sentence()});
    const consumerBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
    const statusBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
    const contributionBadges = any.objectWithKeys(any.listOf(any.word), {factory: badgeFactory});
    const buildBadgeGroup = badgeData => Object.entries(badgeData)
      .map(([name, badge]) => `[![${badge.text}][${name}-badge]][${name}-link]`);

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
      }).then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/README.md`,
        sinon.match(`
<!-- consumer badges -->
${buildBadgeGroup(consumerBadges).join('\n')}

<!-- status badges -->
${buildBadgeGroup(statusBadges).join('\n')}

<!-- contribution badges -->
${buildBadgeGroup(contributionBadges).join('\n')}
`)
      ));
    });
  });
});
