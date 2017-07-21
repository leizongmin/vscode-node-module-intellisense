[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/leizongmin.node-module-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=leizongmin.node-module-intellisense)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/leizongmin.node-module-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=leizongmin.node-module-intellisense)
[![Rating](https://vsmarketplacebadge.apphb.com/rating/leizongmin.node-module-intellisense.svg)](https://marketplace.visualstudio.com/items?itemName=leizongmin.node-module-intellisense)
[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/travis/leizongmin/vscode-node-module-intellisense.svg)](https://travis-ci.org/leizongmin/vscode-node-module-intellisense)
[![David](https://img.shields.io/david/leizongmin/vscode-node-module-intellisense.svg?style=flat-square)](https://david-dm.org/leizongmin/vscode-node-module-intellisense)

# Node.js Modules Intellisense

Visual Studio Code plugin that autocompletes JavaScript / TypeScript modules in import statements.

This plugin was inspired by [Npm Intellisense](https://github.com/ChristianKohler/NpmIntellisense) and [AutoFileName](https://github.com/s6323859/vscode-autofilename).

![auto complete](https://github.com/leizongmin/vscode-node-module-intellisense/raw/master/images/auto_complete.gif)


## Installation

Launch VS Code Quick Open (⌘+P), paste the following command, and press enter.

```
ext install node-module-intellisense
```

View detail on [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=leizongmin.node-module-intellisense)


## Issues & Contribution

If there is any bug, create a pull request or an issue please.
[Github](https://github.com/leizongmin/vscode-node-module-intellisense)


## Configuration

Node.js Module Intellisense scans builtin modules, dependencies, devDependencies and file modules by default.
Set scanBuiltinModules, scanDevDependencies and scanFileModules to false to disable it.

```javascript
{
	// Scans builtin modules as well
  "node-module-intellisense.scanBuiltinModules": true,

  // Scans devDependencies as well
  "node-module-intellisense.scanDevDependencies": true,

  // Scans file modules as well
  "node-module-intellisense.scanFileModules": true,

  /**
   * Scans alternative module paths (eg. Search on ${workspcaceRoot}/lib).
   * Useful when using packages like (https://www.npmjs.com/package/app-module-path) to manage require paths folder.
   **/
  "node-module-intellisense.modulePaths": [],

  // File module extensions
  "node-module-intellisense.fileModuleExtensions": [
    ".js",
    ".jsx",
    ".ts",
    ".d.ts",
    ".tsx",
    ".vue",
    ".json"
  ],
}
```

## Changelog

+ v1.4.0 - Support for scans alternative module paths (useful when using packages like (https://www.npmjs.com/package/app-module-path) to manage require paths folder)
+ v1.3.0 - Fix problem when open a single file (not in workspace)
+ v1.2.0 - Add support for package sub path such as `ts-node/register` (issue #4)
+ v1.1.0 - Fix some problem:
  + Support `export ... from ...` statement (issue #1)
  + Add support for TypeScript `/// <reference...` comment (issue #2)
  + Fix TypeScript `.d.ts` file problem (issue #3)
+ v1.0.4 - Support language `HTML`
+ v1.0.2 - Support custom file module extension name, add `.vue` and `.json` to default
+ v1.0.1 - Fix `.vscodeignore`
+ v1.0.0 - Initial release

## License

```
MIT License

Copyright (c) 2016 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
