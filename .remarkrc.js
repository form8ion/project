exports.settings = {
  listItemIndent: 1,
  emphasis: '_',
  strong: '_',
  bullet: '*',
  incrementListMarker: false
};

exports.plugins = [
  '@form8ion/remark-lint-preset',
  [require('remark-toc'), {tight: true}],
  ['remark-usage', {heading: 'example'}]
];
