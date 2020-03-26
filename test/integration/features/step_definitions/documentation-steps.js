import {promises as fs} from 'fs';
import {Then} from 'cucumber';
import {assert} from 'chai';
import unified from 'unified';
import parseMarkdown from 'remark-parse';

function groupBadges(nodes) {
  return Object.fromEntries(nodes.reduce((acc, node) => {
    if ('html' === node.type) {
      const values = node.value.split(' ')[1];
      return [...acc, [values, {}]];
    }

    if ('paragraph' === node.type) {
      node.children.forEach(child => {
        if ('linkReference' === child.type) {
          acc[acc.length - 1][1][child.label] = child;
        }

        return acc;
      });
    }

    return acc;
  }, []));
}

function assertTitleIsIncluded(readmeTree, projectName) {
  const title = readmeTree.children[0];
  const titleText = title.children[0];

  assert.equal(title.type, 'heading');
  assert.equal(title.depth, 1);
  assert.equal(titleText.type, 'text');
  assert.equal(titleText.value, projectName);
}

function assertDescriptionIsIncluded(readmeTree, projectDescription) {
  const description = readmeTree.children[1];
  const descriptionText = description.children[0];

  assert.equal(description.type, 'paragraph');
  assert.equal(descriptionText.type, 'text');
  assert.equal(descriptionText.value, projectDescription);
}

function assertBadgesSectionExists(node, badgeSection) {
  assert.equal(node.type, 'html');
  assert.equal(node.value, `<!-- ${badgeSection} badges -->`);
}

function assertGroupContainsBadge(badgeGroup, badgeDetails) {
  const badgeFromGroup = badgeGroup[badgeDetails.label];
  const imageReference = badgeFromGroup.children[0];

  assert.equal(imageReference.type, 'imageReference');
  assert.equal(imageReference.label, badgeDetails.imageReferenceLabel);
  assert.equal(imageReference.alt, badgeDetails.imageAltText);
}

Then('the README includes the core details', async function () {
  const readmeTree = unified().use(parseMarkdown).parse(await fs.readFile(`${process.cwd()}/README.md`, 'utf8'));

  assertTitleIsIncluded(readmeTree, this.projectName);
  assertDescriptionIsIncluded(readmeTree, this.projectDescription);
  assertBadgesSectionExists(readmeTree.children[2], 'status');
  assertBadgesSectionExists(readmeTree.children[3], 'consumer');
  assertBadgesSectionExists(readmeTree.children[4], 'contribution');
});

function assertGroupDoesNotContainBadge(badgeGroup, badgeDetails) {
  assert.isUndefined(badgeGroup[badgeDetails.label]);
}

Then('{string} details are included in the README', async function (visibility) {
  const readmeContent = await fs.readFile(`${process.cwd()}/README.md`, 'utf8');
  const readmeTree = unified().use(parseMarkdown).parse(readmeContent);
  const badgeGroups = groupBadges(readmeTree.children);
  const PrsWelcomeDetails = {label: 'PRs-link', imageReferenceLabel: 'PRs-badge', imageAltText: 'PRs Welcome'};

  if ('Public' === visibility) assertGroupContainsBadge(badgeGroups.contribution, PrsWelcomeDetails);
  else assertGroupDoesNotContainBadge(badgeGroups.contribution, 'PRs-link');
});
