import { readFile } from "node:fs/promises";

const contactPage = new URL("../out/contato.html", import.meta.url);
const html = await readFile(contactPage, "utf8");
const requiredMarkers = ["Conte o essencial para iniciarmos", "<form", "Solicitar cotação"];
const missingMarkers = requiredMarkers.filter((marker) => !html.includes(marker));

if (missingMarkers.length > 0) {
  throw new Error(
    `O formulário de cotação não foi incluído no export estático. Marcadores ausentes: ${missingMarkers.join(", ")}`,
  );
}

console.log("Export estático validado: formulário de cotação presente.");
