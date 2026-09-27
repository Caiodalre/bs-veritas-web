import { readFile } from "node:fs/promises";

const contactPage = new URL("../out/contato.html", import.meta.url);
const securityTxtFile = new URL("../out/.well-known/security.txt", import.meta.url);
const html = await readFile(contactPage, "utf8");
const securityTxt = await readFile(securityTxtFile, "utf8");
const requiredMarkers = ["Conte o essencial para iniciarmos", "<form", "Solicitar cotação"];
const missingMarkers = requiredMarkers.filter((marker) => !html.includes(marker));

if (missingMarkers.length > 0) {
  throw new Error(
    `O formulário de cotação não foi incluído no export estático. Marcadores ausentes: ${missingMarkers.join(", ")}`,
  );
}

const requiredSecurityTxtMarkers = [
  "Contact: mailto:contato@bsveritas.com.br",
  "Expires:",
  "Canonical: https://bsveritas.com.br/.well-known/security.txt",
];
const missingSecurityTxtMarkers = requiredSecurityTxtMarkers.filter(
  (marker) => !securityTxt.includes(marker),
);

if (missingSecurityTxtMarkers.length > 0) {
  throw new Error(
    `O security.txt não foi incluído corretamente no export estático. Marcadores ausentes: ${missingSecurityTxtMarkers.join(", ")}`,
  );
}

console.log("Export estático validado: formulário de cotação e security.txt presentes.");
