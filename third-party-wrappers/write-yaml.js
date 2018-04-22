import {promisify} from 'util';
import yaml from 'write-yaml';

export default promisify(yaml);
