/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Zongmin Lei <leizongmin@gmail.com> All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import IntellisenseProvider from "./intellisense";

export function activate(context: vscode.ExtensionContext) {

  const provider = new IntellisenseProvider();
  provider.activate(context);

}

export function deactivate() {}
