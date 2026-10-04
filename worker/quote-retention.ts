import postgres from "postgres";

const retentionCleanupBatchSize = 500;

type QuoteRetentionEnvironment = {
  HYPERDRIVE?: Pick<Hyperdrive, "connectionString">;
  QUOTE_RETENTION_CLEANUP_ENABLED: string;
};

type QuoteRetentionDependencies = {
  logger?: Pick<Console, "error" | "log">;
  purgeExpiredQuotes?: (connectionString: string) => Promise<number>;
};

export async function purgeExpiredQuoteRequests(connectionString: string): Promise<number> {
  const client = postgres(connectionString, {
    max: 1,
    fetch_types: false,
    prepare: true,
  });

  try {
    const [result] = await client<{ deletedCount: number }[]>`
      select public.purge_expired_quote_requests(${retentionCleanupBatchSize}) as "deletedCount"
    `;
    const deletedCount = Number(result?.deletedCount);

    if (!Number.isInteger(deletedCount) || deletedCount < 0) {
      throw new Error("Quote retention cleanup returned an invalid count.");
    }

    return deletedCount;
  } finally {
    await client.end({ timeout: 1 });
  }
}

export async function handleQuoteRetentionCleanup(
  controller: Pick<ScheduledController, "scheduledTime">,
  env: QuoteRetentionEnvironment,
  dependencies: QuoteRetentionDependencies = {},
): Promise<void> {
  if (env.QUOTE_RETENTION_CLEANUP_ENABLED !== "true") {
    return;
  }

  const logger = dependencies.logger ?? console;

  if (!env.HYPERDRIVE) {
    logger.error(
      JSON.stringify({
        event: "quote_retention_cleanup_binding_missing",
        scheduledTime: controller.scheduledTime,
      }),
    );
    throw new Error("Quote retention cleanup binding is missing.");
  }

  const purgeExpiredQuotes = dependencies.purgeExpiredQuotes ?? purgeExpiredQuoteRequests;

  try {
    const deletedCount = await purgeExpiredQuotes(env.HYPERDRIVE.connectionString);
    logger.log(
      JSON.stringify({
        event: "quote_retention_cleanup_completed",
        deletedCount,
        scheduledTime: controller.scheduledTime,
      }),
    );
  } catch (error) {
    logger.error(
      JSON.stringify({
        event: "quote_retention_cleanup_failed",
        errorType: error instanceof Error ? error.name : "UnknownError",
        scheduledTime: controller.scheduledTime,
      }),
    );
    // The runtime also records uncaught exceptions. Do not forward provider details or a cause.
    throw new Error("Quote retention cleanup failed.");
  }
}
