'use strict';

const postcss = require('postcss');
const cssdeclsort = require('css-declaration-sorter');

const scssSyntax = require('postcss-scss');
const lessSyntax = require('postcss-less');

const syntaxes = {
  'CSS': undefined,
  'SCSS': scssSyntax,
  'Less': lessSyntax,
};

module.exports = {
  activate: function () {
    atom.workspace.observeTextEditors(function (editor) {
      editor.getBuffer().onWillSave(function () {
        if (
          atom.config.get('css-declaration-sorter.formatOnSave') &&
          Object.keys(syntaxes).includes(editor.getGrammar().name)
        ) {
          return sort(getConfiguredSortOrder());
        }
      });
    });

    return atom.commands.add('atom-text-editor[data-grammar~=\'css\']', {
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

  return postcss([cssdeclsort({ order: sortOrder })])
    .process(editor.getText(), { syntax: syntax })
    .then(function (result) {
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

function getConfiguredSortOrder () {
  return atom.config.get('css-declaration-sorter.sortOrder');
}
