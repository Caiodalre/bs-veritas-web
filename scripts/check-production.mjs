const productionOrigin = "https://bsveritas.com.br";
const previewOrigin = "https://bs-veritas-web.caio-dalre.workers.dev";
const expectedDs = "2371 13 2 639BF1A3C7C5ADB282C17F0583CB9BE16F1D134E59023ED41A2C37BF04C4554E";
const attempts = 3;
const timeoutMs = 15_000;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const formatError = (error) => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = error.cause instanceof Error ? ` (${error.cause.message})` : "";
  return `${error.message}${cause}`;
};

async function fetchWithRetry(url, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "user-agent": "bs-veritas-production-monitor/1.0",
          ...options.headers,
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.status < 500 || attempt === attempts) {
        return response;
      }

      await response.body?.cancel();
      lastError = new Error(`${url} respondeu ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(500 * attempt);
  }

  throw lastError;
}

async function checkHtmlPage(path) {
  const url = new URL(path, productionOrigin);
  const response = await fetchWithRetry(url, { redirect: "follow" });

  assert(response.status === 200, `${url} respondeu ${response.status}`);
  assert(response.headers.get("content-type")?.includes("text/html"), `${url} não retornou HTML`);

  if (path === "/") {
    const body = await response.text();
    assert(
      /B(?:&amp;|&)S VERITAS/i.test(body),
      "A página inicial não contém a identificação da empresa",
    );
  } else {
    await response.body?.cancel();
  }
}

async function checkTextResource(path, expectedText) {
  const url = new URL(path, productionOrigin);
  const response = await fetchWithRetry(url, { redirect: "follow" });
  const body = await response.text();

  assert(response.status === 200, `${url} respondeu ${response.status}`);
  assert(body.includes(expectedText), `${url} não contém ${expectedText}`);
}

async function checkSecurityHeaders() {
  const response = await fetchWithRetry(`${productionOrigin}/`, {
    redirect: "manual",
  });

  const expectedHeaders = new Map([
    ["content-security-policy", "default-src 'self'"],
    ["permissions-policy", "camera=()"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["strict-transport-security", "max-age=31536000"],
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
  ]);

  for (const [name, expectedValue] of expectedHeaders) {
    const value = response.headers.get(name);
    assert(value?.includes(expectedValue), `Cabeçalho ${name} ausente ou inválido`);
  }

  assert(
    !response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex"),
    "A produção recebeu noindex",
  );
  await response.body?.cancel();
}

async function checkCanonicalRedirect() {
  const source = "https://www.bsveritas.com.br/seguros/auto?origem=monitor";
  const destination = "https://bsveritas.com.br/seguros/auto?origem=monitor";
  const response = await fetchWithRetry(source, { redirect: "manual" });

  assert(response.status === 301, `${source} respondeu ${response.status}`);
  assert(
    response.headers.get("location") === destination,
    "O redirecionamento www não preservou caminho e query string",
  );
  await response.body?.cancel();
}

async function checkPreview() {
  const response = await fetchWithRetry(`${previewOrigin}/`, {
    redirect: "manual",
  });

  assert(response.status === 200, `O preview respondeu ${response.status}`);
  assert(
    response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex"),
    "O preview perdeu o cabeçalho noindex",
  );
  await response.body?.cancel();
}

async function queryDns(resolver, name, type) {
  const url = new URL(resolver);
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);

  const response = await fetchWithRetry(url, {
    headers: { accept: "application/dns-json" },
  });
  const payload = await response.json();

  assert(response.status === 200, `${url.origin} respondeu ${response.status}`);
  assert(payload.Status === 0, `${name} ${type} retornou DNS status ${payload.Status}`);
  assert(payload.AD === true, `${name} ${type} não foi autenticado por DNSSEC`);
  assert(payload.Answer?.length > 0, `${name} ${type} não retornou respostas`);

  return payload.Answer.map((answer) => answer.data);
}

async function checkDnssec() {
  const resolvers = ["https://cloudflare-dns.com/dns-query", "https://dns.google/resolve"];

  for (const resolver of resolvers) {
    const dsRecords = await queryDns(resolver, "bsveritas.com.br", "DS");
    const normalizedRecords = dsRecords.map((record) =>
      record.replace(/\s+/g, " ").trim().toUpperCase(),
    );
    assert(normalizedRecords.includes(expectedDs), `${resolver} retornou um DS inesperado`);

    await queryDns(resolver, "bsveritas.com.br", "A");
  }
}

async function checkEmailDns() {
  const resolver = "https://cloudflare-dns.com/dns-query";
  const mxRecords = await queryDns(resolver, "bsveritas.com.br", "MX");

  for (const exchange of [
    "route1.mx.cloudflare.net",
    "route2.mx.cloudflare.net",
    "route3.mx.cloudflare.net",
  ]) {
    assert(
      mxRecords.some((record) => record.includes(exchange)),
      `Registro MX ${exchange} ausente`,
    );
  }

  const spfRecords = await queryDns(resolver, "bsveritas.com.br", "TXT");
  assert(
    spfRecords.some((record) => record.includes("v=spf1 include:_spf.mx.cloudflare.net ~all")),
    "Registro SPF ausente ou alterado",
  );

  const dmarcRecords = await queryDns(resolver, "_dmarc.bsveritas.com.br", "TXT");
  assert(
    dmarcRecords.some((record) => record.includes("v=DMARC1; p=reject;")),
    "Registro DMARC ausente ou alterado",
  );

  const dkimRecords = await queryDns(resolver, "cf2024-1._domainkey.bsveritas.com.br", "TXT");
  assert(
    dkimRecords.some((record) => record.includes("v=DKIM1") && record.includes("p=")),
    "Registro DKIM ausente ou alterado",
  );
}

const checks = [
  ["página inicial", () => checkHtmlPage("/")],
  ["página Sobre", () => checkHtmlPage("/sobre")],
  ["catálogo de seguros", () => checkHtmlPage("/seguros")],
  ["página de sinistros", () => checkHtmlPage("/sinistros")],
  ["página de contato", () => checkHtmlPage("/contato")],
  ["robots.txt", () => checkTextResource("/robots.txt", "Sitemap:")],
  ["sitemap", () => checkTextResource("/sitemap.xml", "<urlset")],
  ["cabeçalhos de segurança", checkSecurityHeaders],
  ["redirecionamento www", checkCanonicalRedirect],
  ["proteção do preview", checkPreview],
  ["cadeia DNSSEC", checkDnssec],
  ["registros de e-mail", checkEmailDns],
];

const failures = [];

console.log(`Monitor de produção iniciado em ${new Date().toISOString()}`);

for (const [name, check] of checks) {
  try {
    await check();
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = formatError(error);
    failures.push(`${name}: ${message}`);
    console.error(`FAIL ${name}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} verificação(ões) falharam.`);
  process.exitCode = 1;
} else {
  console.log("Todas as verificações passaram.");
}
