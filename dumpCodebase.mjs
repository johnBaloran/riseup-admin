import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "src"); // only src/
const allowedExtensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"];
const skipFiles = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".env",
  ".eslintrc.json",
  ".prettierrc",
];

const files = [];

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    if (file.startsWith(".")) return; // skip hidden

    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (!["node_modules", ".git"].includes(file)) {
        walk(filepath);
      }
    } else {
      if (skipFiles.includes(file)) return;
      if (allowedExtensions.includes(path.extname(file))) {
        files.push(filepath);
      }
    }
  });
}

walk(rootDir);

if (files.length === 0) {
  console.log("No files found to dump.");
  process.exit(0);
}

// Split into 5 roughly equal parts
const chunkSize = Math.ceil(files.length / 5);
const chunks = [
  files.slice(0, chunkSize),
  files.slice(chunkSize, chunkSize * 2),
  files.slice(chunkSize * 2, chunkSize * 3),
  files.slice(chunkSize * 3, chunkSize * 4),
  files.slice(chunkSize * 4),
];

chunks.forEach((chunk, index) => {
  const outFile = `codebase${index + 1}.txt`;
  const output = fs.createWriteStream(outFile);

  chunk.forEach((file) => {
    output.write(`\n\n----- ${path.relative(rootDir, file)} -----\n\n`);
    output.write(fs.readFileSync(file, "utf-8"));
  });

  output.end();
  console.log(`Written ${outFile} with ${chunk.length} files`);
});