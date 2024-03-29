import {promises as fs} from 'fs';

import {Then} from '@cucumber/cucumber';
import {assert} from 'chai';

Then('basic configuration is added', async function () {
  assert.equal(
    await fs.readFile(`${process.cwd()}/.editorconfig`, 'utf-8'),
    `# EditorConfig is awesome: http://EditorConfig.org

# top-most EditorConfig file
root = true

[*]
charset = utf-8
trim_trailing_whitespace = true
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
`
  );
});
