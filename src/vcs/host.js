import scaffoldGithub from './github';

export default async function ({host, projectRoot, projectType, description}) {
  if ('GitHub' === host) await scaffoldGithub({projectRoot, projectType, description});
}
