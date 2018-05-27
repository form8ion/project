import scaffoldGithub from './github';

export default async function ({host, owner, projectName, projectRoot, projectType, description}) {
  if ('GitHub' === host) await scaffoldGithub({projectRoot, projectType, description});

  return {host, name: projectName, owner};
}
