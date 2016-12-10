# Node.js Module Intellisense

Visual Studio Code plugin that autocompletes Node.js modules in import statements.

This plugin was inspired from [Npm Intellisense](https://github.com/ChristianKohler/NpmIntellisense) and
[AutoFileName](https://github.com/s6323859/vscode-autofilename).

![auto complete](https://github.com/leizongmin/vscode-node-module-intellisense/raw/master/images/auto_complete.gif)


## Installation

In the command palette (cmd-shift-p) select Install Extension and choose npm Intellisense.

![install](https://github.com/leizongmin/vscode-node-module-intellisense/raw/master/images/npm_install.gif)


## Contributing

If the is any bug, create a pull request or an issue please.
[Github](https://github.com/leizongmin/vscode-node-module-intellisense)


## Settings

Node.js Module Intellisense scans builtin modules, dependencies, devDependencies and file modules by default.
Set `scanBuiltinModules`, `scanDevDependencies` and `scanFileModules` to false to disable it.

```javascript
{
	// Scans builtin modules as well
  "node-module-intellisense.scanBuiltinModules": true,

  // Scans devDependencies as well
  "node-module-intellisense.scanDevDependencies": true,

  // Scans file modules as well
  "node-module-intellisense.scanFileModules": true,
}
```

## History

* v0.1.0 - Initial release

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
