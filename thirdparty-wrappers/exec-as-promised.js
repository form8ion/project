import {exec} from 'shelljs';

export default function (command, options = {}) {
  return new Promise((resolve, reject) => exec(
    command,
    {silent: true, ...options},
    (code, stdout, stderr) => {
      if (0 === code) resolve(stdout);
      const error = new Error(`script exited with a non-zero exit code (${code})`);
      error.data = {code, stdout, stderr};
      reject(error);
    }
  ));
}
