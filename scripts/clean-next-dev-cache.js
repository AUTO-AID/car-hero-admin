/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const devCacheDir = path.resolve(projectRoot, ".next", "dev");
const expectedPrefix = path.resolve(projectRoot, ".next") + path.sep;

if (!devCacheDir.startsWith(expectedPrefix)) {
  throw new Error(`Refusing to remove unexpected path: ${devCacheDir}`);
}

if (fs.existsSync(devCacheDir)) {
  fs.rmSync(devCacheDir, { recursive: true, force: true });
  console.log("Removed stale Next dev cache:", path.relative(projectRoot, devCacheDir));
}
