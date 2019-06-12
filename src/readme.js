import {promises} from 'fs';
import {resolve} from 'path';
import mustache from 'mustache';
import {info} from '@travi/cli-messages';

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


export default async function ({projectName, projectRoot, description, badges, documentation}) {
  info('Generating README');

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

  await promises.writeFile(
    `${projectRoot}/README.md`,
    mustache.render(
      await promises.readFile(resolve(__dirname, '..', 'templates/README.mustache'), 'utf8'),
      {projectName, description, references, badges: markdownBadges, documentation}
    )
  );
}
