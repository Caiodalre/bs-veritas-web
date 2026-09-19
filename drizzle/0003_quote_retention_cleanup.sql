CREATE OR REPLACE FUNCTION public.purge_expired_quote_requests(batch_limit integer DEFAULT 500)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF batch_limit IS NULL OR batch_limit < 1 OR batch_limit > 500 THEN
    RAISE EXCEPTION 'batch_limit must be between 1 and 500'
      USING ERRCODE = '22023';
  END IF;

  WITH expired AS (
    SELECT id
    FROM public.quote_requests
    WHERE retention_expires_at <= pg_catalog.clock_timestamp()
    ORDER BY retention_expires_at, id
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED
  ),
  deleted AS (
    DELETE FROM public.quote_requests AS quote_request
    USING expired
    WHERE quote_request.id = expired.id
    RETURNING 1
  )
  SELECT count(*)::integer
  INTO deleted_count
  FROM deleted;

  RETURN deleted_count;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.purge_expired_quote_requests(integer) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.purge_expired_quote_requests(integer) TO bs_veritas_quote_writer;
