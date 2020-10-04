'use strict';

const { sort } = require('../lib/css-declaration-sorter');

describe('CSS Declaration Sorter', function () {
  let editor;

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.workspace.open().then(function (result) {
        editor = result;
        spyOn(editor, 'getText').andCallThrough();
      });
    });

    waitsForPromise(function () {
      return Promise.all([
        atom.packages.activatePackage('language-css'),
        atom.packages.activatePackage('language-less'),
        atom.packages.activatePackage('language-sass'),
      ]);
    });
  });

  afterEach(function () {
    expect(editor.getText).toHaveBeenCalled();
  });

  it('sorts CSS', function () {
    editor.setGrammar(atom.grammars.grammarForScopeName('source.css'));
    editor.setText('a{ flex: 0; border: 0; }');
    waitsForPromise(() => sort('alphabetical', editor));

    editor.onDidChange(function () {
      expect(editor.getText()).toBe('a{ border: 0; flex: 0; }');
    });
  });

  it('sorts LESS', function () {
    editor.setGrammar(atom.grammars.grammarForScopeName('source.css.less'));
    editor.setText('a{\n//flex\nflex:0;\nborder:0;\n}');
    waitsForPromise(() => sort('alphabetical', editor));

    editor.onDidChange(function () {
      expect(editor.getText()).toBe('a{\nborder:0;\n//flex\nflex:0;\n}');
    });
  });

  it('sorts SCSS', function () {
    editor.setGrammar(atom.grammars.grammarForScopeName('source.css.scss'));
    editor.setText('a{\n//flex\nflex:0;\nborder:0;\n}');
    waitsForPromise(() => sort('alphabetical', editor));

    editor.onDidChange(function () {
      expect(editor.getText()).toBe('a{\nborder:0;\n//flex\nflex:0;\n}');
    });
  });
});
