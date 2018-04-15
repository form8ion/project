import scaffoldGithub from './github';

export default async function ({host, projectName, projectRoot, projectType}) {
  if ('GitHub' === host) await scaffoldGithub({projectRoot, projectType});

  return {host, name: projectName, owner: 'travi'};
}
