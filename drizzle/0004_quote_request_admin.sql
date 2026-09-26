CREATE INDEX "quote_requests_created_at_id_idx" ON "quote_requests" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "quote_requests_status_created_at_id_idx" ON "quote_requests" USING btree ("status","created_at","id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.list_quote_requests(
  requested_status public.quote_request_status DEFAULT NULL,
  cursor_created_at timestamp with time zone DEFAULT NULL,
  cursor_id uuid DEFAULT NULL,
  result_limit integer DEFAULT 21
)
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  full_name varchar(150),
  phone varchar(32),
  email varchar(254),
  insurance_type varchar(64),
  city varchar(120),
  message text,
  retention_expires_at timestamp with time zone,
  status public.quote_request_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
BEGIN
  IF result_limit IS NULL OR result_limit < 1 OR result_limit > 51 THEN
    RAISE EXCEPTION 'result_limit must be between 1 and 51'
      USING ERRCODE = '22023';
  END IF;

  IF (cursor_created_at IS NULL) <> (cursor_id IS NULL) THEN
    RAISE EXCEPTION 'cursor_created_at and cursor_id must be provided together'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    quote_request.id,
    quote_request.created_at,
    quote_request.full_name,
    quote_request.phone,
    quote_request.email,
    quote_request.insurance_type,
    quote_request.city,
    quote_request.message,
    quote_request.retention_expires_at,
    quote_request.status
  FROM public.quote_requests AS quote_request
  WHERE
    (requested_status IS NULL OR quote_request.status = requested_status)
    AND (
      cursor_created_at IS NULL
      OR (quote_request.created_at, quote_request.id) < (cursor_created_at, cursor_id)
    )
  ORDER BY quote_request.created_at DESC, quote_request.id DESC
  LIMIT result_limit;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.set_quote_request_status(
  request_id uuid,
  requested_status public.quote_request_status
)
RETURNS TABLE (
  id uuid,
  status public.quote_request_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.quote_requests AS quote_request
  SET status = requested_status
  WHERE quote_request.id = request_id
  RETURNING quote_request.id, quote_request.status;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_quote_requests(public.quote_request_status, timestamp with time zone, uuid, integer) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.set_quote_request_status(uuid, public.quote_request_status) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_quote_requests(public.quote_request_status, timestamp with time zone, uuid, integer) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.set_quote_request_status(uuid, public.quote_request_status) TO bs_veritas_quote_writer;
