import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import ts from "typescript";

// Preserve ESM so the same remark pipeline runs in Node 20 and in Next.js.
const directory = mkdtempSync(join(tmpdir(), "altria-blog-tests-"));
try {
  writeFileSync(join(directory, "package.json"), '{"type":"module"}');
  symlinkSync(join(process.cwd(), "node_modules"), join(directory, "node_modules"), "dir");
  for (const folder of ["lib", "tests"]) {
    mkdirSync(join(directory, folder));
    for (const filename of readdirSync(folder).filter((file) =>
      file.endsWith(".ts"),
    )) {
      const source = readFileSync(join(folder, filename), "utf8");
      const result = ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          esModuleInterop: true,
        },
      });
      writeFileSync(
        join(directory, folder, filename.replace(/\.ts$/, ".js")),
        result.outputText.replace(/(from\s+["']|import\s*\(["'])(\.\.?\/[^"']+)(["'])/g,
          (_, before, specifier, quote) => `${before}${specifier.replace(/\.ts$/, "").replace(/(?<!\.js)$/, ".js")}${quote}`),
      );
    }
  }
  const tests = readdirSync(join(directory, "tests")).map((file) =>
    join(directory, "tests", file),
  );
  const result = spawnSync(process.execPath, ["--test", ...tests], {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
