import {readFile, writeFile} from 'mz/fs';
import {resolve} from 'path';
import chalk from 'chalk';
import mustache from 'mustache';

function buildBadgeMarkdown([name, badge]) {
  return `[![${badge.text}][${name}-badge]][${name}-link]`;
}

function buildBadgeReferences(acc, [name, badge]) {
  return ([
    ...acc,
    {key: `${name}-link`, value: badge.link},
    {key: `${name}-badge`, value: badge.img}
  ]);
}


export default async function ({projectName, projectRoot, description, badges}) {
  console.log(chalk.blue('Generating README'));     // eslint-disable-line no-console

  const markdownBadges = {
    consumer: Object.entries(badges.consumer).map(buildBadgeMarkdown),
    status: Object.entries(badges.status).map(buildBadgeMarkdown),
    contribution: Object.entries(badges.contribution).map(buildBadgeMarkdown)
  };

  const references = [
    ...Object.entries(badges.consumer).reduce(buildBadgeReferences, []),
    ...Object.entries(badges.status).reduce(buildBadgeReferences, []),
    ...Object.entries(badges.contribution).reduce(buildBadgeReferences, [])
  ].filter(Boolean);

  await writeFile(
    `${projectRoot}/README.md`,
    mustache.render(
      await readFile(resolve(__dirname, '..', 'templates/README.mustache'), 'utf8'),
      {projectName, description, references, badges: markdownBadges}
    )
  );
}
