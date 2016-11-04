'use strict';

const postcss = require('postcss');
const cssdeclsort = require('css-declaration-sorter');

const scssSyntax = require('postcss-scss');
const lessSyntax = require('postcss-less');

const syntaxes = {
  'SCSS': scssSyntax,
  'Less': lessSyntax
};

module.exports = {
  activate: function () {
    return atom.commands.add('atom-text-editor[data-grammar~=\'css\']', {
      'css-declaration-sorter:sort': function () {
        var sortOrder = atom.config.get('css-declaration-sorter.sortOrder');
        return sort(sortOrder);
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
    sortOrder: {
      title: 'Default sorting order',
      description: 'Select the default sorting order.',
      type: 'string',
      default: 'alphabetically',
      enum: ['alphabetically', 'smacss', 'concentric-css']
    }
  }
};

const sort = function (sortOrder) {
  var editor = atom.workspace.getActiveTextEditor();
  var syntax = syntaxes[editor.getGrammar().name];

  postcss([cssdeclsort({ order: sortOrder })])
    .process(editor.getText(), { syntax: syntax })
      .then(function (result) {
        editor.setText(result.content);
      })
      .catch(function (error) {
        atom.notifications.addError('Sorting CSS parsing error.', {
          detail: error,
          icon: 'zap'
        });
      });
};
