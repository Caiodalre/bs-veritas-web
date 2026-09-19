import { describe, expect, it, vi } from "vitest";
import { handleQuoteRetentionCleanup } from "../worker/quote-retention";

const controller = {
  scheduledTime: Date.parse("2026-09-20T06:17:00.000Z"),
};

function createLogger() {
  return {
    error: vi.fn(),
    log: vi.fn(),
  };
}

describe("handleQuoteRetentionCleanup", () => {
  it("não acessa o banco quando a rotina está desativada", async () => {
    const purgeExpiredQuotes = vi.fn();

    await handleQuoteRetentionCleanup(
      controller,
      {
        QUOTE_RETENTION_CLEANUP_ENABLED: "false",
      },
      { purgeExpiredQuotes },
    );

    expect(purgeExpiredQuotes).not.toHaveBeenCalled();
  });

  it("falha de forma explícita quando o Hyperdrive está ausente", async () => {
    const logger = createLogger();

    await expect(
      handleQuoteRetentionCleanup(
        controller,
        {
          QUOTE_RETENTION_CLEANUP_ENABLED: "true",
        },
        { logger },
      ),
    ).rejects.toThrow("Quote retention cleanup binding is missing.");

    expect(logger.error).toHaveBeenCalledWith(
      JSON.stringify({
        event: "quote_retention_cleanup_binding_missing",
        scheduledTime: controller.scheduledTime,
      }),
    );
  });

  it("executa um lote e registra somente a contagem", async () => {
    const logger = createLogger();
    const purgeExpiredQuotes = vi.fn(async () => 3);

    await handleQuoteRetentionCleanup(
      controller,
      {
        HYPERDRIVE: { connectionString: "postgres://example.invalid/database" },
        QUOTE_RETENTION_CLEANUP_ENABLED: "true",
      },
      { logger, purgeExpiredQuotes },
    );

    expect(purgeExpiredQuotes).toHaveBeenCalledWith("postgres://example.invalid/database");
    expect(logger.log).toHaveBeenCalledWith(
      JSON.stringify({
        event: "quote_retention_cleanup_completed",
        deletedCount: 3,
        scheduledTime: controller.scheduledTime,
      }),
    );
  });

  it("registra o tipo da falha sem expor a conexão", async () => {
    const logger = createLogger();
    const purgeExpiredQuotes = vi.fn(async () => {
      throw new TypeError("postgres://secret.example/database");
    });

    await expect(
      handleQuoteRetentionCleanup(
        controller,
        {
          HYPERDRIVE: { connectionString: "postgres://secret.example/database" },
          QUOTE_RETENTION_CLEANUP_ENABLED: "true",
        },
        { logger, purgeExpiredQuotes },
      ),
    ).rejects.toThrow(TypeError);

    const loggedValue = logger.error.mock.calls.flat().join(" ");
    expect(loggedValue).toContain("quote_retention_cleanup_failed");
    expect(loggedValue).toContain("TypeError");
    expect(loggedValue).not.toContain("secret.example");
  });
});
