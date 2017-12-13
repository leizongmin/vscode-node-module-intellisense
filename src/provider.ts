/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zongmin Lei <leizongmin@gmail.com> All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  CancellationToken,
  Command,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  Disposable,
  ExtensionContext,
  FileSystemWatcher,
  Position,
  TextDocument,
  TextEdit,
  Uri,
  WorkspaceConfiguration,
} from "vscode";
import resolvePackage from "./resolve";

export default class IntellisenseProvider implements CompletionItemProvider {

  /**
   * Builtin Node.js modules
   */
  public static readonly builtinModules: string[] = getBuiltinModules();

  public static readonly configPath: string = "node-module-intellisense";
  public static readonly defaultAutoStripExtensions: string[] = [ ".js", ".jsx", ".ts", ".d.ts", ".tsx", ".json" ];
  public static readonly languageSelector: string[] = [ "javascript", "javascriptreact", "typescript", "typescriptreact", "html" ];
  public static readonly triggerCharacters: string[] = [ "'", "\"", "/" ];

  private context: ExtensionContext;

  private dependencies: string[] = [];
  private packageJsonFile: string = this.resolveWorkspacePath("package.json");
  private packageJsonWatcher: FileSystemWatcher;

  private config: WorkspaceConfiguration;
  private enableDevDependencies: boolean = true;
  private enableFileModules: boolean = true;
  private modulePaths: string[] = [];
  private enableBuiltinModules: boolean = true;
  private autoStripExtensions: string[] = IntellisenseProvider.defaultAutoStripExtensions;

  private readonly disposables: Disposable[] = [];

  public activate(context: ExtensionContext) {
    this.context = context;
    context.subscriptions.push(this);

    // load configuration
    const loadConfig = () => {
      this.config = vscode.workspace.getConfiguration(IntellisenseProvider.configPath);
      this.enableBuiltinModules = this.config.get("scanBuiltinModules", true);
      this.enableDevDependencies = this.config.get("scanDevDependencies", true);
      this.enableFileModules = this.config.get("scanFileModules", true);
      this.modulePaths = this.config.get("modulePaths", []);
      this.autoStripExtensions = this.config.get("autoStripExtensions", IntellisenseProvider.defaultAutoStripExtensions);
      this.autoStripExtensions.sort((a, b) => b.length - a.length);
      // this.debug(this.autoStripExtensions);
    };
    vscode.workspace.onDidChangeConfiguration((e) => {
      loadConfig();
      // this.debug("reload config", this.config);
    });
    loadConfig();
    // this.debug("load config", this.config);

    // create completion provider
    vscode.languages.registerCompletionItemProvider(IntellisenseProvider.languageSelector, this, ...IntellisenseProvider.triggerCharacters);
    // this.debug("activate");
    // this.debug("builtinModules", IntellisenseProvider.builtinModules);

    // load dependencies from package.json file
    this.updateDependenciesFromPackageJson();
    // watching package.json and auto update dependencies info
    this.packageJsonWatcher = vscode.workspace.createFileSystemWatcher("**/package.json");
    this.disposables.push(this.packageJsonWatcher);
    const onPackageJsonFileChange = (e: Uri) => {
      // this.debug("workspace file change:", e);
      if (e.fsPath === this.packageJsonFile) {
        this.updateDependenciesFromPackageJson();
      }
    };
    this.packageJsonWatcher.onDidChange(onPackageJsonFileChange);
    this.packageJsonWatcher.onDidCreate(onPackageJsonFileChange);
    this.packageJsonWatcher.onDidDelete(onPackageJsonFileChange);
  }

  public dispose() {
    // this.debug("dispose");
    this.disposables.forEach((item) => {
      try {
        item.dispose();
      } catch (err) {
        // this.debug("dispose", err);
      }
    });
  }

  /**
   * Provide completion items for the given position and document.
   *
   * @param document The document in which the command was invoked.
   * @param position The position at which the command was invoked.
   * @param token A cancellation token.
   * @return An array of completions, a [completion list](#CompletionList), or a thenable that resolves to either.
   * The lack of a result can be signaled by returning `undefined`, `null`, or an empty array.
   */
  public async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Promise<CompletionItem[]> {
    const info = parseLine(document, position);
    if (!info) {
      return [];
    }

    // this.debug("provideCompletionItems: parseLine", position, info);

    let list: CompletionItem[] = [];

    const isShowPackageSubPath = info.isPackagePath && info.search.indexOf("/") > 0;
    const isShowPackage = info.isPackagePath || info.search === "";
    const isShowFile = info.isAbsoultePath || info.isRelativePath || info.search === "";
    const isIncludeExtname = info.type === "reference";

    if (isShowPackageSubPath) {

      // package sub path
      let pkgDir;
      try {
        pkgDir = await resolvePackageDirectory(info.packageName, document.uri.fsPath);
        const currentDir = path.resolve(pkgDir, info.packageSubPath);
        const files = await this.readCurrentDirectory(currentDir, info.search, false);
        // fix insertText
        files.forEach((item) => {
          item.insertText = item.label.slice(info.search.length);
        });
        list = list.concat(files);
      } catch (err) {
        this.debug("resolvePackageDirectory", err);
      }

    } else {

      // builtin modules
      if (isShowPackage && this.enableBuiltinModules) {
        list = IntellisenseProvider.builtinModules.map((name) => {
          return createCompletionItem(name, CompletionItemKind.Module, { detail: "builtin module" });
        });
      }

      // packages npm dependencies
      if (isShowPackage) {
        list = list.concat(this.dependencies.map((name) => {
          return createCompletionItem(name, CompletionItemKind.Module, { detail: "npm dependencies" });
        }));
      }
    }

    // packages from relative path
    if (isShowFile && this.enableFileModules) {
      const currentDir = path.resolve(path.dirname(document.uri.fsPath), info.search);
      const files = await this.readCurrentDirectory(currentDir, info.search || "./", isIncludeExtname);
      // fix insertText
      files.forEach((item) => {
        item.insertText = item.label.slice(info.search.length);
      });
      list = list.concat(files);
    }

    // packages from relative path
    if (this.modulePaths.length > 0) {
      for (const modulePath of this.modulePaths) {
        const currentDir = this.resolveWorkspacePath(modulePath.replace("${workspaceRoot}", ""), info.search || "");
        const files = await this.readCurrentDirectory(currentDir, info.search || "", isIncludeExtname);
        // fix insertText
        files.forEach((item) => {
          item.insertText = item.label.slice(info.search.length);
        });
        list = list.concat(files);
      }
    }

    // this.debug("provideCompletionItems", list);
    return list;
  }

  /**
   * Given a completion item fill in more data, like [doc-comment](#CompletionItem.documentation)
   * or [details](#CompletionItem.detail).
   *
   * The editor will only resolve a completion item once.
   *
   * @param item A completion item currently active in the UI.
   * @param token A cancellation token.
   * @return The resolved completion item or a thenable that resolves to of such. It is OK to return the given
   * `item`. When no result is returned, the given `item` will be used.
   */
  public resolveCompletionItem?(item: CompletionItem, token: CancellationToken): CompletionItem | Thenable<CompletionItem> {
    // this.debug("resolveCompletionItem", item);
    return item;
  }

  private debug(...data: any[]): void {
    // tslint:disable-next-line:no-console
    console.log("IntellisenseProvider debug:", ...data);
  }

  private showWarning(msg: string): void {
    vscode.window.showWarningMessage(`node-module-intellisense: ${ msg }`);
  }

  private resolveWorkspacePath(...paths: string[]): string {
    if (vscode.workspace.rootPath) {
      return path.resolve(vscode.workspace.rootPath, ...paths);
    }
    return path.resolve(...paths);
  }

  private async updateDependenciesFromPackageJson(): Promise<void> {
    // check if file exists
    const exists = await isFileExists(this.packageJsonFile);
    if (!exists) {
      // this.debug("package.json file not exists");
      return;
    }
    // get file content
    let data: string;
    try {
      data = (await readFileContent(this.packageJsonFile)).toString();
    } catch (err) {
      return this.showWarning(err.message);
    }
    // parse JSON file
    let json;
    try {
      json = JSON.parse(data.toString());
    } catch (err) {
      return this.showWarning(`parsing package.json file error: ${ err.message }`);
    }
    // get dependencies
    const list = new Set<string>();
    if (json.dependencies) {
      Object.keys(json.dependencies).forEach((name) => list.add(name));
    }
    if (this.enableDevDependencies && json.devDependencies) {
      Object.keys(json.devDependencies).forEach((name) => list.add(name));
    }
    this.dependencies = Array.from(list.values());
    // this.debug("load dependencies from package.json:", this.dependencies);
  }
  private async readCurrentDirectory(dir: string, prefix: string, isIncludeExtname: boolean): Promise<CompletionItem[]> {
    const names = await readdir(dir);
    const list: CompletionItem[] = [];
    const fileMap = new Map<string, boolean>();

    const relativePathInfo = (p) => {
      if (vscode.workspace.rootPath) {
        return `relative to workspace: ${ path.relative(vscode.workspace.rootPath, p) }`;
      }
      return `absolute path: ${ p }`;
    };

    list.push(createCompletionItem("..", CompletionItemKind.File, {
      detail: "directory",
      documentation: relativePathInfo(path.dirname(dir)),
    }));

    for (const name of names) {
      const realPath = path.join(dir, name);
      const stats = await readFileStats(realPath);
      if (stats.isDirectory()) {
        // directory
        list.push(createCompletionItem(`${ prefix }${ name }`, CompletionItemKind.File, {
          detail: "directory",
          documentation: relativePathInfo(realPath),
        }));
      } else if (stats.isFile()) {
        // file
        const [ strip, ext ] = parseFileExtensionName(name, this.autoStripExtensions);
        this.debug("FILE", name, strip, ext);
        let n = name;
        if (!isIncludeExtname && strip) {
          n = name.slice(0, name.length - ext.length);
        }
        if (!fileMap.has(n)) {
          fileMap.set(n, true);
          list.push(createCompletionItem(`${ prefix }${ n }`, CompletionItemKind.File, {
            detail: "file module",
            documentation: relativePathInfo(realPath),
          }));
        }
      }
    }
    return list;
  }

}

/**
 * returns builtin modules
 */
function getBuiltinModules(): string[] {
  return Object.keys((process as any).binding("natives")).filter((n) => {
    if (n.indexOf("_") !== -1) {
      return false;
    }
    if (n.indexOf("/") !== -1) {
      return false;
    }
    if (n.indexOf("-") !== -1) {
      return false;
    }
    return true;
  });
}

interface ExtraCompletionInfo {
  label?: string;
  kind?: CompletionItemKind;
  detail?: string;
  documentation?: string;
  sortText?: string;
  filterText?: string;
  insertText?: string;
  command?: Command;
  textEdit?: TextEdit;
  additionalTextEdits?: TextEdit;
}

/**
 * create CompletionItem
 */
function createCompletionItem(name: string, kind: CompletionItemKind, info: ExtraCompletionInfo): CompletionItem {
  const item = new CompletionItem(name, kind);
  Object.assign(item, info);
  return item;
}

/**
 * returns true if file is exists
 */
function isFileExists(filename: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.exists(filename, resolve);
  });
}

/**
 * returns file content
 */
function readFileContent(filename: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

/**
 * returns file stats
 */
function readFileStats(filename: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(filename, (err, stats) => {
      if (err) {
        return reject(err);
      }
      resolve(stats);
    });
  });
}

/**
 * returns directory files
 */
function readdir(dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, list) => {
      if (err) {
        return reject(err);
      }
      resolve(list);
    });
  });
}

interface IntellisenseLineInfo {
  line?: string;
  quotation?: string;
  quotationStart?: number;
  search?: string;
  isAbsoultePath?: boolean;
  isRelativePath?: boolean;
  isPackagePath?: boolean;
  packageName?: string;
  packageSubPath?: string;
  position?: Position;
  type?: StatementType;
}

type StatementType = "require" | "import" | "export" | "reference" | false;

/**
 * Parse current line
 */
function parseLine(document: TextDocument, position: Position): IntellisenseLineInfo {
  const info: IntellisenseLineInfo = {
    position,
  };

  const line = document.getText(document.lineAt(position).range);
  info.type = getStatementType(line);
  if (!info.type) {
    return;
  }

  const [ i, quotation ] = getForwardQuotation(line, position.character);
  info.quotation = quotation;
  info.quotationStart = i;
  info.search = line.slice(i + 1, position.character);

  if (info.search[0] === ".") {
    info.isRelativePath = true;
  } else if (info.search[0] === "/") {
    info.isAbsoultePath = true;
  } else {
    info.isPackagePath = true;
    let j = info.search.indexOf(path.sep);
    if (j !== -1 && info.search[0] === "@") {
      j = info.search.indexOf(path.sep, j + 1);
    }
    if (j === -1) {
      info.packageName = info.search;
      info.packageSubPath = "";
    } else {
      info.packageName = info.search.slice(0, j);
      info.packageSubPath = info.search.slice(j + 1);
    }
  }
  return info;
}

/**
 * Returns statement type
 */
function getStatementType(line: string): StatementType {
  line = line.trim();
  if (line.indexOf("import ") === 0) {
    return "import";
  }
  if (line.indexOf("require(") !== -1) {
    return "require";
  }
  if (line.indexOf("export ") === 0 && line.indexOf(" from ") !== -1) {
    return "export";
  }
  if (line.trim().indexOf("/// <reference ") === 0) {
    return "reference";
  }
  return false;
}

/**
 * Returns forward quotation position and character
 */
function getForwardQuotation(line: string, index: number): [ number, string ] {
  const i = line.lastIndexOf("\"", index - 1);
  const j = line.lastIndexOf("'", index - 1);
  if (i > j) {
    return [ i, "\"" ];
  }
  return [ j, "'" ];
}

/**
 * Parse File extension name
 */
function parseFileExtensionName(filename: string, autoStripExtensions: string[]): [ boolean, string ] {
  const len = filename.length;
  for (const ext of autoStripExtensions) {
    if (filename.slice(len - ext.length) === ext) {
      return [ true, ext ];
    }
  }
  return [ false, "" ];
}

/**
 * Returns require package directory from current path
 */
function resolvePackageDirectory(pkgName: string, filename: string): Promise<string> {
  return resolvePackage(pkgName, path.dirname(filename));
}
