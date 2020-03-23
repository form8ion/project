import {promises as fs} from 'fs';
import {Then} from 'cucumber';
import {assert} from 'chai';
import unified from 'unified';
import parseMarkdown from 'remark-parse';

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

Then('the README includes the core details', async function () {
  const readmeTree = unified().use(parseMarkdown).parse(await fs.readFile(`${process.cwd()}/README.md`, 'utf8'));

  assertTitleIsIncluded(readmeTree, this.projectName);
  assertDescriptionIsIncluded(readmeTree, this.projectDescription);
  assertBadgesSectionExists(readmeTree.children[2], 'status');
  assertBadgesSectionExists(readmeTree.children[3], 'consumer');
  assertBadgesSectionExists(readmeTree.children[4], 'contribution');
});
