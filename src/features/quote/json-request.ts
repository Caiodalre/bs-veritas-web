export type JsonRequestFailureReason =
  | "unsupported-media-type"
  | "invalid-content-length"
  | "payload-too-large"
  | "invalid-json"
  | "read-failed";

export type JsonRequestResult =
  { success: true; data: unknown } | { success: false; reason: JsonRequestFailureReason };

function hasJsonContentType(contentType: string | null) {
  return contentType?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

function getDeclaredLength(request: Request): number | null | "invalid" {
  const contentLength = request.headers.get("content-length");

  if (contentLength === null) {
    return null;
  }

  if (!/^(0|[1-9]\d*)$/.test(contentLength)) {
    return "invalid";
  }

  const parsedLength = Number(contentLength);
  return Number.isSafeInteger(parsedLength) ? parsedLength : "invalid";
}

async function cancelReader(reader: ReadableStreamDefaultReader<Uint8Array>) {
  try {
    await reader.cancel();
  } catch {
    // The request is already being rejected, so a failed cancellation does not change the result.
  }
}

export async function parseLimitedJsonRequest(
  request: Request,
  maxBytes: number,
): Promise<JsonRequestResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new RangeError("maxBytes must be a positive safe integer.");
  }

  if (!hasJsonContentType(request.headers.get("content-type"))) {
    return { success: false, reason: "unsupported-media-type" };
  }

  const declaredLength = getDeclaredLength(request);

  if (declaredLength === "invalid") {
    return { success: false, reason: "invalid-content-length" };
  }

  if (declaredLength !== null && declaredLength > maxBytes) {
    return { success: false, reason: "payload-too-large" };
  }

  if (request.body === null) {
    return { success: false, reason: "invalid-json" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const chunk = await reader.read();

      if (chunk.done) {
        break;
      }

      totalBytes += chunk.value.byteLength;

      if (totalBytes > maxBytes) {
        await cancelReader(reader);
        return { success: false, reason: "payload-too-large" };
      }

      chunks.push(chunk.value);
    }
  } catch {
    return { success: false, reason: "read-failed" };
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(body);
    const data: unknown = JSON.parse(text);
    return { success: true, data };
  } catch {
    return { success: false, reason: "invalid-json" };
  }
}
