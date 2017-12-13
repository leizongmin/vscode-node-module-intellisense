/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zongmin Lei <leizongmin@gmail.com> All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import * as fs from "fs";
import * as path from "path";

function isDirExists(file: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        return resolve(false);
      }
      resolve(stats.isDirectory());
    });
  });
}

function getAllParentNodeModulesDir(dir: string): string[] {
  const dirs = [ path.resolve(dir, "node_modules") ];
  while (true) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dirs.push(path.resolve(parent, "node_modules"));
    dir = parent;
  }
  return dirs;
}

export default async function resolvePackage(name: string, dir: string): Promise<string> {
  const dirs = getAllParentNodeModulesDir(dir);
  for (const item of dirs) {
    const p = path.resolve(item, name);
    if (await isDirExists(p)) {
      return p;
    }
  }
  const err = new Error(`cannot find module "${name} in ${dir}"`);
  (err as any).code = "MODULE_NOT_FOUND";
  throw err;
}
