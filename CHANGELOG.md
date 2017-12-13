# Change Log

+ v1.5.0 - Updates:
  + Fix issue [#10](https://github.com/leizongmin/vscode-node-module-intellisense/issues/10) Add ability to resolve `@scoped/packages` subdirectories
  + Support all file extensions
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
