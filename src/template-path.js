import {resolve} from 'path';
import filedirname from 'filedirname';

export default function determinePathToTemplate(fileName) {
  const [, __dirname] = filedirname();

  return resolve(__dirname, '..', 'templates', fileName);
}
