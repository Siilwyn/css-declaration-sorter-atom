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
      default: 'box-sizing, display, visibility, z-index, position, top, right, bottom, left, offset-inline-start, offset-inline-end, offset-block-start, offset-block-end, grid, grid-area, grid-auto-columns, grid-auto-flow, grid-auto-rows, grid-column, grid-column-end, grid-column-start, grid-row, grid-row-end, grid-row-start, grid-template, grid-template-areas, grid-template-columns, grid-template-rows, flex, flex-basis, flex-direction, flex-flow, flex-grow, flex-shrink, flex-wrap, box-decoration-break, place-content, place-items, place-self, align-content, align-items, align-self, justify-content, justify-items, justify-self, order, width, min-width, max-width, height, min-height, max-height, inline-size, min-inline-size, max-inline-size, block-size, min-block-size, max-block-size, margin, margin-top, margin-right, margin-bottom, margin-left, margin-inline-start, margin-inline-end, margin-block-start, margin-block-end, padding, padding-top, padding-right, padding-bottom, padding-left, padding-inline-start, padding-inline-end, padding-block-start, padding-block-end, float, clear, overflow, overflow-x, overflow-y, orphans, columns, column-gap, column-fill, column-rule, column-rule-color, column-rule-style, column-rule-width, column-span, column-count, column-width, row-gap, object-fit, object-position, transform, transform-box, transform-origin, transform-style, rotate, scale, border, border-top, border-right, border-bottom, border-left, border-width, border-top-width, border-right-width, border-bottom-width, border-left-width, border-style, border-top-style, border-right-style, border-bottom-style, border-left-style, border-radius, border-top-right-radius, border-top-left-radius, border-bottom-right-radius, border-bottom-left-radius, border-inline-start, border-inline-start-color, border-inline-start-style, border-inline-start-width, border-inline-end, border-inline-end-color, border-inline-end-style, border-inline-end-width, border-block-start, border-block-start-color, border-block-start-style, border-block-start-width, border-block-end, border-block-end-color, border-block-end-style, border-block-end-width, border-color, border-image, border-image-outset, border-image-repeat, border-image-slice, border-image-source, border-image-width, border-top-color, border-right-color, border-bottom-color, border-left-color, border-collapse, border-spacing, outline, outline-color, outline-offset, outline-style, outline-width, backdrop-filter, backface-visibility, background, background-attachment, background-blend-mode, background-clip, background-color, background-image, background-origin, background-position, background-position-x, background-position-y, background-repeat, background-size, box-shadow, isolation,  ruby-align, ruby-position, color, caret-color, font, font-family, src, font-feature-settings, font-kerning, font-language-override, font-size, font-optical-sizing, font-size-adjust, font-stretch, font-style, font-synthesis, font-variant, font-variant-alternates, font-variant-caps, font-variant-east-asian, font-variant-ligatures, font-variant-numeric, font-variant-position, font-weight, font-display, hyphens, initial-letter, initial-letter-align, letter-spacing, line-break, line-height, list-style, list-style-image, list-style-position, list-style-type, direction, text-align, text-align-last, text-decoration, text-decoration-color, text-decoration-line, text-decoration-skip, text-decoration-style, text-decoration-skip-ink, text-emphasis, text-emphasis-position, text-emphasis-color, text-emphasis-style, text-indent, text-justify, text-underline-position, text-orientation, text-overflow, text-rendering, text-shadow, text-size-adjust, text-transform, vertical-align, white-space, word-break, word-spacing, overflow-wrap, all, animation, animation-name, animation-duration, animation-fill-mode, animation-play-state, animation-timing-function, animation-delay, animation-iteration-count, animation-direction, mix-blend-mode, break-before, break-after, break-inside, page-break-before, page-break-after, page-break-inside, caption-side, clip-path, content, counter-increment, counter-reset, cursor, empty-cells, filter, image-orientation, image-rendering, mask, mask-clip, mask-image, mask-origin, mask-position, mask-repeat, mask-size, mask-type, opacity, perspective, perspective-origin, pointer-events, quotes, resize, scroll-behavior, scroll-snap-coordinate, scroll-snap-destination, scroll-snap-type, shape-image-threshold, shape-margin, shape-outside, tab-size, table-layout, text-combine-upright, touch-action, transition, transition-delay, transition-duration, transition-property, transition-timing-function, will-change, unicode-bidi, unicode-range, user-select, widows, writing-mod',
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

  if (sortOrder == 'custom') {
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
