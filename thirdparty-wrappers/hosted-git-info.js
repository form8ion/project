import {fromUrl as hostedFromUrl} from 'hosted-git-info';

export function fromUrl(...args) {
  return hostedFromUrl(...args);
}
