-- Applied by an administrator; this migration creates no login role.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'bs_veritas_quote_writer'
  ) THEN
    CREATE ROLE bs_veritas_quote_writer
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;
--> statement-breakpoint
REVOKE ALL ON TABLE public.quote_requests FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON TYPE public.quote_request_status FROM PUBLIC;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT USAGE ON TYPE public.quote_request_status TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT INSERT ON TABLE public.quote_requests TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT SELECT (id) ON TABLE public.quote_requests TO bs_veritas_quote_writer;
