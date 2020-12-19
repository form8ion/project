import {fromUrl as hostedFromUrl} from 'hosted-git-info';

export function fromUrl(...args) {
  const {user, project} = hostedFromUrl(...args);

  return {owner: user, name: project};
}
