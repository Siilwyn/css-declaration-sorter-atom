'use strict';

const { sort } = require('../lib/css-declaration-sorter');

describe('CSS Declaration Sorter', function () {
  let editor;
  let testItem;
  let testCase;

  const testConfig = [
    {
      name: 'sorts CSS',
      scopeName: 'source.css',
      text: 'a{ flex: 0; box-sizing: border-box; border: 0; }',
      expect: [
        {
          sortType: 'alphabetical',
          expectString: 'a{ border: 0; box-sizing: border-box; flex: 0; }',
        },
        {
          sortType: 'smacss',
          expectString: 'a{ box-sizing: border-box; flex: 0; border: 0; }',
        },
        {
          sortType: 'concentric-css',
          expectString: 'a{ flex: 0; box-sizing: border-box; border: 0; }',
        }
      ]
    },

    {
      name: 'sorts LESS',
      scopeName: 'source.css.less',
      text: 'a{\n//flex\nflex:0;\nbox-sizing:border-box;\nborder:0;\n}',
      expect: [
        {
          sortType: 'alphabetical',
          expectString: 'a{\nborder:0;\nbox-sizing:border-box;\n//flex\nflex:0;\n}',
        },
        {
          sortType: 'smacss',
          expectString: 'a{\nbox-sizing:border-box;\n//flex\nflex:0;\nborder:0;\n}',
        },
        {
          sortType: 'concentric-css',
          expectString: 'a{\n//flex\nflex:0;\nbox-sizing:border-box;\nborder:0;\n}',
        }
      ]
    },

    {
      name: 'sorts SCSS',
      scopeName: 'source.css.scss',
      text: 'a{\n//flex\nflex:0;\nbox-sizing:border-box;\nborder:0;\n}',
      expect: [
        {
          sortType: 'alphabetical',
          expectString: 'a{\nborder:0;\nbox-sizing:border-box;\n//flex\nflex:0;\n}',
        },
        {
          sortType: 'smacss',
          expectString: 'a{\nbox-sizing:border-box;\n//flex\nflex:0;\nborder:0;\n}',
        },
        {
          sortType: 'concentric-css',
          expectString: 'a{\n//flex\nflex:0;\nbox-sizing:border-box;\nborder:0;\n}',
        }
      ]
    }
  ];

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

  for (testItem of testConfig) {
    const {
      name: testName,
      scopeName,
      text
    } = testItem;
    for (testCase of testItem.expect) {
      const {
        sortType,
        expectString
      } = testCase;

      it(`${testName}-${sortType} (${scopeName})`, function () {
        editor.setGrammar(atom.grammars.grammarForScopeName(scopeName));
        editor.setText(text);

        return sort(sortType, editor).then(function () {
          expect(editor.getText()).toBe(expectString);
        });
      });
    }
  }
});
