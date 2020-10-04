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
      'css-declaration-sorter:sort-custom': () =>
        sort('custom'),
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
      order: 1,
      title: 'Format file on save',
      description: 'Automatically format file when saving.',
      type: 'boolean',
      default: false,
    },
    sortOrder: {
      order: 2,
      title: 'Default sorting order',
      description: 'Select the default sorting order.',
      type: 'string',
      default: 'alphabetical',
      enum: ['alphabetical', 'smacss', 'concentric-css', 'custom'],
    },
    customOrder: {
      order: 3,
      title: 'Custom sorting order',
      description: 'Select the default sorting order.',
      type: 'string',
      default: 'place your own order',
    }
  },
  sort,
};

function sort (sortOrder, editor = atom.workspace.getActiveTextEditor()) {
  if (!editor) return;

  const syntax = syntaxes[editor.getGrammar().name];

  return postcss([getDeclarationSorter(sortOrder)])
    .process(editor.getText(), { syntax, from: undefined })
    .then((result) => {
      const input = result.root.source.input.css.split('\n');
      const output = result.css.split('\n');

      return editor.transact(() => {
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

function getDeclarationSorter (sortOrder) {
  const sortObject = {
    order: sortOrder
  };

  if (sortOrder === 'custom') {
    const customOrder = getConfiguredCustomSortOrder();
    sortObject.order = (a, b) => customOrder.indexOf(a) - customOrder.indexOf(b);
  }

  return cssDeclarationSorter(sortObject);
}

function getConfiguredSortOrder () {
  return atom.config.get('css-declaration-sorter.sortOrder');
}

function getConfiguredCustomSortOrder () {
  return atom.config.get('css-declaration-sorter.customOrder');
}
