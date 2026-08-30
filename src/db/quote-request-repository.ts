import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import { quoteRequests } from "@/db/schema";
import type { QuoteRequestRepository } from "@/features/quote/service";

export type QuoteDatabase = PostgresJsDatabase<typeof schema>;

export function createDrizzleQuoteRequestRepository(
  database: QuoteDatabase,
): QuoteRequestRepository {
  return {
    async create(request) {
      const [created] = await database
        .insert(quoteRequests)
        .values(request)
        .returning({ id: quoteRequests.id });

      if (!created) {
        throw new Error("Quote request was not persisted.");
      }

      return created;
    },
  };
}
