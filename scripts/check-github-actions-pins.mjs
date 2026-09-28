import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const workflowDirectories = [".github/workflows", ".github/actions"];
const yamlExtensions = new Set([".yml", ".yaml"]);
const externalActionPattern = /^[^@\s]+@[0-9a-f]{40}$/i;
const unpinnedReferences = [];

async function collectYamlFiles(directory) {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectYamlFiles(entryPath)));
    } else if (yamlExtensions.has(extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

for (const directory of workflowDirectories) {
  const files = await collectYamlFiles(directory);

  for (const file of files) {
    const lines = (await readFile(file, "utf8")).split(/\r?\n/);

    lines.forEach((line, index) => {
      const match = line.match(/^\s*uses:\s*["']?([^"'#\s]+)["']?/);
      if (!match) return;

      const reference = match[1];
      if (reference.startsWith("./") || reference.startsWith("docker://")) return;

      if (!externalActionPattern.test(reference)) {
        unpinnedReferences.push(`${file}:${index + 1} (${reference})`);
      }
    });
  }
}

if (unpinnedReferences.length > 0) {
  throw new Error(
    `GitHub Actions externas sem commit SHA completo:\n${unpinnedReferences.join("\n")}`,
  );
}

console.log("GitHub Actions validadas: todas as referências externas usam commits imutáveis.");
