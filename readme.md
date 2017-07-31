# CSS Declaration Sorter Package
[![Travis Build Status][travis-icon]][travis]
[![David Dependencies Status][david-icon]][david]
[![David devDependencies Status][david-dev-icon]][david-dev]

Sorts your CSS declarations, or Less and SCSS, in Atom, never gets tired. If you want to define a sort order project-wide check out the [css-declaration-sorter](https://github.com/Siilwyn/css-declaration-sorter#readme) Node.js module.

![show-off](https://raw.githubusercontent.com/Siilwyn/css-declaration-sorter-atom/master/show-off.gif)

## Commands and Keybindings
All of the following commands are under the `atom-text-editor[data-grammar~='css']` selector.

|Command|Description|
|-------|-----------|
|`css-declaration-sorter:sort`|Sorts according to configured order in the settings|
|`css-declaration-sorter:sort-alphabetically`|Sorts alphabetically|
|`css-declaration-sorter:sort-smacss`|Sorts according to [SMACSS](https://smacss.com/book/formatting#grouping)|
|`css-declaration-sorter:sort-concentric-css`|Sorts according to [Concentric CSS](https://github.com/brandon-rhodes/Concentric-CSS)|

By default `css-declaration-sorter:sort` is mapped to `ctrl-alt-c`. You may want to use keyboard shortcuts for triggering the other commands. You can easily [define your own](http://flight-manual.atom.io/using-atom/sections/basic-customization/#_customizing_keybindings).

[travis]: https://travis-ci.org/Siilwyn/css-declaration-sorter-atom
[travis-icon]: https://img.shields.io/travis/Siilwyn/css-declaration-sorter-atom/master.svg?style=flat-square
[david]: https://david-dm.org/Siilwyn/css-declaration-sorter-atom
[david-icon]: https://img.shields.io/david/Siilwyn/css-declaration-sorter-atom.svg?style=flat-square
[david-dev]: https://david-dm.org/Siilwyn/css-declaration-sorter-atom#info=devDependencies
[david-dev-icon]: https://img.shields.io/david/dev/Siilwyn/css-declaration-sorter-atom.svg?style=flat-square
