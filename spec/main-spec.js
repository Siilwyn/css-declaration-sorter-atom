'use strict';

describe('CSS Declaration Sorter', function () {
  let editor;
  let workspaceElement;

  const activatePackage = function () {
    const packageActivation = atom.packages.activatePackage('css-declaration-sorter');
    atom.commands.dispatch(workspaceElement, 'css-declaration-sorter:sort');
    waitsForPromise(() => packageActivation);
  };

  beforeEach(function () {
    waitsForPromise(function () {
      return atom.workspace.open().then(function (result) {
        editor = result;
        jasmine.attachToDOM(editor.element);
        workspaceElement = atom.views.getView(editor);
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
    activatePackage();

    editor.onDidChange(function () {
      expect(editor.getText()).toBe('a{ border: 0; flex: 0; }');
    });
  });

  it('sorts LESS', function () {
    editor.setGrammar(atom.grammars.grammarForScopeName('source.css.less'));
    editor.setText('a{\n//flex\nflex:0;border:0;}');
    activatePackage();

    editor.onDidChange(function () {
      expect(editor.getText()).toBe('a{border:0;\n//flex\nflex:0;}');
    });
  });

  it('sorts SCSS', function () {
    editor.setGrammar(atom.grammars.grammarForScopeName('source.css.scss'));
    editor.setText('a{\n//flex\nflex:0;border:0;}');
    activatePackage();

    editor.onDidChange(function () {
      expect(editor.getText()).toBe('a{border:0;\n//flex\nflex:0;}');
    });
  });
});
