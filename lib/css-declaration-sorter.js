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
  activate: function () {
    editorObserver = atom.workspace.observeTextEditors(handleEvents);

    commands = atom.commands.add('atom-text-editor[data-grammar~=\'css\']', {
      'css-declaration-sorter:sort': function () {
        return sort(getConfiguredSortOrder());
      },
      'css-declaration-sorter:sort-alphabetically': function () {
        return sort('alphabetically');
      },
      'css-declaration-sorter:sort-smacss': function () {
        return sort('smacss');
      },
      'css-declaration-sorter:sort-concentric-css': function () {
        return sort('concentric-css');
      }
    });
  },
  deactivate: function () {
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
      default: 'alphabetically',
      enum: ['alphabetically', 'smacss', 'concentric-css']
    },
  }
};

function sort (sortOrder) {
  const editor = atom.workspace.getActiveTextEditor();
  const syntax = syntaxes[editor.getGrammar().name];

  return postcss([cssDeclarationSorter({ order: sortOrder })])
    .process(editor.getText(), { syntax: syntax, from: undefined })
    .then(function (result) {
      if (result.content === editor.getText()) return;

      const cursorPosition = editor.getCursorScreenPosition();
      editor.setText(result.content);
      editor.setCursorScreenPosition(cursorPosition);
    })
    .catch(function (error) {
      atom.notifications.addError('Sorting CSS parsing error.', {
        detail: error,
        icon: 'zap',
        dismissable: true,
      });
    });
}

function handleEvents (editor) {
  editor.getBuffer().onWillSave(function () {
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
