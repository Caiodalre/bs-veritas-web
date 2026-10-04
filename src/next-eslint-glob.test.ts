/** @vitest-environment node */

import { createRequire } from "node:module";
import path from "node:path";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const requireFromTest = createRequire(import.meta.url);
const requireFromConfig = createRequire(requireFromTest.resolve("eslint-config-next"));
const requireFromPlugin = createRequire(requireFromConfig.resolve("@next/eslint-plugin-next"));
const { getRootDirs } = requireFromPlugin("./utils/get-root-dirs") as {
  getRootDirs: (context: {
    cwd: string;
    settings: { next?: { rootDir?: string | string[] } };
  }) => string[];
};

function roots(rootDir?: string | string[]) {
  return getRootDirs({ cwd: process.cwd(), settings: { next: { rootDir } } })
    .map((directory) => path.resolve(directory))
    .sort();
}

describe("substituição de glob restrita ao plugin Next ESLint", () => {
  it("resolve o alias para a versão auditada de tinyglobby", () => {
    const dependency = requireFromPlugin("fast-glob/package.json") as {
      name: string;
      version: string;
    };
    expect(dependency.name).toBe("tinyglobby");
    expect(dependency.version).toBe("0.2.17");
  });

  it("preserva a raiz padrão", () => {
    expect(roots()).toEqual([process.cwd()]);
  });

  it.each(["src", "src/", path.resolve("src"), path.resolve("src").replaceAll("\\", "/")])(
    "não expande o diretório estático %s",
    (pattern) => {
      expect(roots(pattern)).toEqual([path.resolve("src")]);
    },
  );

  it.each(["src/{app,components}", "src/+(app|components)", ["src/app", "src/components"]])(
    "encontra as raízes esperadas para %j",
    (pattern) => {
      expect(roots(pattern)).toEqual(
        [path.resolve("src/app"), path.resolve("src/components")].sort(),
      );
    },
  );

  it("retorna vazio para uma raiz inexistente ou um arquivo", () => {
    expect(roots("src/nonexistent-next-root")).toEqual([]);
    expect(roots("package.json")).toEqual([]);
  });

  it.each([undefined, ".", ["."]])(
    "mantém a regra de links internos ativa com rootDir %j",
    async (rootDir) => {
      const eslint = new ESLint({ overrideConfig: { settings: { next: { rootDir } } } });
      const [result] = await eslint.lintText(
        'export default function Probe() { return <a href="/seguros/">Seguros</a>; }',
        { filePath: path.resolve("src/app/glob-compatibility-probe.tsx") },
      );
      expect(
        result.messages.some((message) => message.ruleId === "@next/next/no-html-link-for-pages"),
      ).toBe(true);
      expect(result.fatalErrorCount).toBe(0);
    },
    // Loading the full Next/TypeScript ESLint configuration is slower in the parallel suite.
    15_000,
  );
});
