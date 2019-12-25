'use strict';

const importLazy = require('import-lazy')(require);

const postcss = importLazy('postcss');
const cssDeclarationSorter = importLazy('css-declaration-sorter');
const scssSyntax = importLazy('postcss-scss');
const lessSyntax = importLazy('postcss-less');

const syntaxes = {
  'CSS': undefined,
  'SCSS': scssSyntax,
  'Less': lessSyntax,
};

let editorObserver;
let commands;

module.exports = {
  activate: () => {
    editorObserver = atom.workspace.observeTextEditors(handleEvents);

    commands = atom.commands.add('atom-text-editor[data-grammar~=\'css\']', {
      'css-declaration-sorter:sort': () =>
        sort(getConfiguredSortOrder()),
      'css-declaration-sorter:sort-alphabetical': () =>
        sort('alphabetical'),
      'css-declaration-sorter:sort-smacss': () =>
        sort('smacss'),
      'css-declaration-sorter:sort-concentric-css': () =>
        sort('concentric-css'),
    });
  },
  deactivate: () => {
    if (editorObserver) {
      editorObserver.dispose();
    }

    if (commands) {
      commands.dispose();
    }
  },
  config: {
    formatOnSave: {
      title: 'Format file on save',
      description: 'Automatically format file when saving.',
      type: 'boolean',
      default: false,
    },
    sortOrder: {
      title: 'Default sorting order',
      description: 'Select the default sorting order.',
      type: 'string',
      default: 'alphabetical',
      enum: ['alphabetical', 'smacss', 'concentric-css'],
    },
  },
};

function sort (sortOrder) {
  const editor = atom.workspace.getActiveTextEditor();
  const syntax = syntaxes[editor.getGrammar().name];

  return postcss([cssDeclarationSorter({ order: sortOrder })])
    .process(editor.getText(), { syntax, from: undefined })
    .then((result) => {
      const input = result.root.source.input.css.split('\n');
      const output = result.css.split('\n');

      editor.transact(() => {
        input.forEach((line, lineNumber) => {
          if (line !== output[lineNumber]) {
            editor.setTextInBufferRange(
              [[lineNumber, 0], [lineNumber, line.length]],
              output[lineNumber]
            );
          }
        });
      });
    })
    .catch((error) => {
      atom.notifications.addError('Sorting CSS parsing error.', {
        detail: error,
        icon: 'zap',
        dismissable: true,
      });
    });
}

function handleEvents (editor) {
  editor.getBuffer().onWillSave(() => {
    if (
      atom.config.get('css-declaration-sorter.formatOnSave') &&
      Object.keys(syntaxes).includes(editor.getGrammar().name)
    ) {
      return sort(getConfiguredSortOrder());
    }
  });
}

function getConfiguredSortOrder () {
  return atom.config.get('css-declaration-sorter.sortOrder');
}
