import Module, { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

// Compile the actual source for Node-only tests. No preview server or browser.
const root = process.cwd();
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith("@/") ? resolve(root, request.slice(2)) : request, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  Module._extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), { fileName: filename, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } });
    module._compile(outputText, filename);
  };
}
export const requireProject = createRequire(resolve(root, "package.json"));
export const loadProject = (name) => requireProject(resolve(root, name));
