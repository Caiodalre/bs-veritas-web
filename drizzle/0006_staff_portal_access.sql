ALTER TABLE "staff_members" ADD COLUMN "access_subject" varchar(255);--> statement-breakpoint
ALTER TABLE "staff_members" ADD COLUMN "is_master" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "staff_members_access_subject_unique_idx" ON "staff_members" USING btree ("access_subject") WHERE "staff_members"."access_subject" is not null;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_access_subject_check" CHECK ("staff_members"."access_subject" is null or (char_length(btrim("staff_members"."access_subject")) between 1 and 255 and "staff_members"."access_subject" = btrim("staff_members"."access_subject")));--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_master_role_check" CHECK (not "staff_members"."is_master" or "staff_members"."role" = 'administrator');
--> statement-breakpoint
UPDATE public.staff_members
SET is_master = true, updated_at = pg_catalog.now()
WHERE id = (
  SELECT staff_member.id
  FROM public.staff_members AS staff_member
  WHERE staff_member.active
    AND staff_member.role = 'administrator'::public.staff_role
  ORDER BY staff_member.created_at ASC, staff_member.id ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1
  FROM public.staff_members AS existing_master
  WHERE existing_master.active AND existing_master.is_master
);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_operations_summary(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.update_insurance_sale(text, uuid, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.create_insurance_sale(text, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.list_insurance_sales(text, date, uuid, integer);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.update_staff_member(text, uuid, text, text, public.staff_role, boolean);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.create_staff_member(text, text, text, public.staff_role);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.list_staff_members(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.bootstrap_operations_admin(text, text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.get_operations_session(text);
--> statement-breakpoint
DROP FUNCTION IF EXISTS public.is_operations_admin(text);
--> statement-breakpoint
CREATE FUNCTION public.is_operations_actor(actor_email text, actor_subject text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members AS staff_member
    WHERE staff_member.email = lower(btrim(actor_email))
      AND staff_member.access_subject = btrim(actor_subject)
      AND staff_member.active
  );
$$;
--> statement-breakpoint
CREATE FUNCTION public.is_operations_admin(actor_email text, actor_subject text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members AS staff_member
    WHERE staff_member.email = lower(btrim(actor_email))
      AND staff_member.access_subject = btrim(actor_subject)
      AND staff_member.active
      AND staff_member.role = 'administrator'::public.staff_role
  );
$$;
--> statement-breakpoint
CREATE FUNCTION public.is_operations_master(actor_email text, actor_subject text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members AS staff_member
    WHERE staff_member.email = lower(btrim(actor_email))
      AND staff_member.access_subject = btrim(actor_subject)
      AND staff_member.active
      AND staff_member.role = 'administrator'::public.staff_role
      AND staff_member.is_master
  );
$$;
--> statement-breakpoint
CREATE FUNCTION public.get_operations_session(actor_email text, actor_subject text)
RETURNS TABLE (
  staff_member_id uuid,
  staff_name varchar(150),
  staff_role public.staff_role,
  staff_is_master boolean,
  bootstrap_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('bs_veritas_operations_identity_binding')
  );

  UPDATE public.staff_members AS staff_member
  SET access_subject = btrim(actor_subject), updated_at = pg_catalog.now()
  WHERE staff_member.email = lower(btrim(actor_email))
    AND staff_member.active
    AND staff_member.access_subject IS NULL
    AND btrim(actor_subject) <> ''
    AND NOT EXISTS (
      SELECT 1
      FROM public.staff_members AS bound_staff
      WHERE bound_staff.access_subject = btrim(actor_subject)
    );

  RETURN QUERY
  SELECT
    actor.id,
    actor.name,
    actor.role,
    actor.is_master,
    NOT EXISTS (SELECT 1 FROM public.staff_members) AS bootstrap_available
  FROM (VALUES (1)) AS singleton(value)
  LEFT JOIN LATERAL (
    SELECT
      staff_member.id,
      staff_member.name,
      staff_member.role,
      staff_member.is_master
    FROM public.staff_members AS staff_member
    WHERE staff_member.email = lower(btrim(actor_email))
      AND staff_member.access_subject = btrim(actor_subject)
      AND staff_member.active
    LIMIT 1
  ) AS actor ON true;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.bootstrap_operations_master(
  actor_email text,
  actor_subject text,
  actor_name text
)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('bs_veritas_operations_bootstrap')
  );

  IF EXISTS (SELECT 1 FROM public.staff_members) OR btrim(actor_subject) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO public.staff_members (
    name,
    email,
    access_subject,
    role,
    is_master,
    active
  ) VALUES (
    btrim(actor_name),
    lower(btrim(actor_email)),
    btrim(actor_subject),
    'administrator'::public.staff_role,
    true,
    true
  )
  RETURNING *;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.list_staff_members(actor_email text, actor_subject text)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
BEGIN
  IF NOT public.is_operations_admin(actor_email, actor_subject) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT staff_member.*
  FROM public.staff_members AS staff_member
  ORDER BY
    staff_member.active DESC,
    staff_member.is_master DESC,
    staff_member.name ASC,
    staff_member.id ASC;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.create_staff_member(
  actor_email text,
  actor_subject text,
  requested_name text,
  requested_email text,
  requested_role public.staff_role,
  requested_is_master boolean
)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
BEGIN
  IF NOT public.is_operations_master(actor_email, actor_subject) THEN
    RAISE EXCEPTION 'operations master required' USING ERRCODE = '42501';
  END IF;
  IF requested_is_master AND requested_role <> 'administrator'::public.staff_role THEN
    RAISE EXCEPTION 'master role requires administrator' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  INSERT INTO public.staff_members (name, email, role, is_master, active)
  VALUES (
    btrim(requested_name),
    lower(btrim(requested_email)),
    requested_role,
    requested_is_master,
    true
  )
  RETURNING *;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.update_staff_member(
  actor_email text,
  actor_subject text,
  staff_id uuid,
  requested_name text,
  requested_email text,
  requested_role public.staff_role,
  requested_is_master boolean,
  requested_active boolean
)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
DECLARE
  current_staff public.staff_members%ROWTYPE;
BEGIN
  IF NOT public.is_operations_master(actor_email, actor_subject) THEN
    RAISE EXCEPTION 'operations master required' USING ERRCODE = '42501';
  END IF;
  IF requested_is_master AND requested_role <> 'administrator'::public.staff_role THEN
    RAISE EXCEPTION 'master role requires administrator' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO current_staff
  FROM public.staff_members
  WHERE id = staff_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF current_staff.email = lower(btrim(actor_email)) AND (
    lower(btrim(requested_email)) <> current_staff.email
    OR requested_role <> 'administrator'::public.staff_role
    OR NOT requested_is_master
    OR NOT requested_active
  ) THEN
    RAISE EXCEPTION 'a master cannot remove their own access' USING ERRCODE = '22023';
  END IF;

  IF current_staff.is_master
    AND current_staff.active
    AND (NOT requested_is_master OR NOT requested_active)
    AND (
      SELECT count(*)
      FROM public.staff_members
      WHERE is_master AND active
    ) <= 1
  THEN
    RAISE EXCEPTION 'at least one active master is required' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  UPDATE public.staff_members AS staff_member
  SET
    name = btrim(requested_name),
    email = lower(btrim(requested_email)),
    access_subject = CASE
      WHEN lower(btrim(requested_email)) = current_staff.email
        THEN current_staff.access_subject
      ELSE NULL
    END,
    role = requested_role,
    is_master = requested_is_master,
    active = requested_active,
    updated_at = pg_catalog.now()
  WHERE staff_member.id = staff_id
  RETURNING staff_member.*;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.list_insurance_sales(
  actor_email text,
  actor_subject text,
  cursor_sold_at date DEFAULT NULL,
  cursor_id uuid DEFAULT NULL,
  result_limit integer DEFAULT 21
)
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  sold_at date,
  staff_member_id uuid,
  staff_member_name varchar(150),
  customer_name varchar(150),
  insurer varchar(120),
  insurance_type varchar(64),
  policy_number varchar(80),
  premium_amount numeric(14, 2),
  brokerage_commission_amount numeric(14, 2),
  employee_payout_amount numeric(14, 2),
  payout_status public.payout_status,
  payout_paid_at timestamp with time zone,
  notes text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
DECLARE
  actor public.staff_members%ROWTYPE;
BEGIN
  SELECT * INTO actor
  FROM public.staff_members AS staff_member
  WHERE staff_member.email = lower(btrim(actor_email))
    AND staff_member.access_subject = btrim(actor_subject)
    AND staff_member.active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'operations actor required' USING ERRCODE = '42501';
  END IF;
  IF result_limit IS NULL OR result_limit < 1 OR result_limit > 51 THEN
    RAISE EXCEPTION 'result_limit must be between 1 and 51' USING ERRCODE = '22023';
  END IF;
  IF (cursor_sold_at IS NULL) <> (cursor_id IS NULL) THEN
    RAISE EXCEPTION 'cursor_sold_at and cursor_id must be provided together' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    sale.id,
    sale.created_at,
    sale.updated_at,
    sale.sold_at,
    sale.staff_member_id,
    staff_member.name,
    sale.customer_name,
    sale.insurer,
    sale.insurance_type,
    sale.policy_number,
    sale.premium_amount,
    sale.brokerage_commission_amount,
    sale.employee_payout_amount,
    sale.payout_status,
    sale.payout_paid_at,
    sale.notes
  FROM public.insurance_sales AS sale
  INNER JOIN public.staff_members AS staff_member ON staff_member.id = sale.staff_member_id
  WHERE (actor.role = 'administrator'::public.staff_role OR sale.staff_member_id = actor.id)
    AND (cursor_sold_at IS NULL OR (sale.sold_at, sale.id) < (cursor_sold_at, cursor_id))
  ORDER BY sale.sold_at DESC, sale.id DESC
  LIMIT result_limit;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.create_insurance_sale(
  actor_email text,
  actor_subject text,
  requested_sold_at date,
  requested_staff_member_id uuid,
  requested_customer_name text,
  requested_insurer text,
  requested_insurance_type text,
  requested_policy_number text,
  requested_premium_amount numeric,
  requested_brokerage_commission_amount numeric,
  requested_employee_payout_amount numeric,
  requested_payout_status public.payout_status,
  requested_notes text
)
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  sold_at date,
  staff_member_id uuid,
  staff_member_name varchar(150),
  customer_name varchar(150),
  insurer varchar(120),
  insurance_type varchar(64),
  policy_number varchar(80),
  premium_amount numeric(14, 2),
  brokerage_commission_amount numeric(14, 2),
  employee_payout_amount numeric(14, 2),
  payout_status public.payout_status,
  payout_paid_at timestamp with time zone,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
DECLARE
  created_sale public.insurance_sales%ROWTYPE;
BEGIN
  IF NOT public.is_operations_admin(actor_email, actor_subject) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE id = requested_staff_member_id AND active
  ) THEN
    RAISE EXCEPTION 'active staff member required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.insurance_sales (
    sold_at,
    staff_member_id,
    customer_name,
    insurer,
    insurance_type,
    policy_number,
    premium_amount,
    brokerage_commission_amount,
    employee_payout_amount,
    payout_status,
    payout_paid_at,
    notes
  ) VALUES (
    requested_sold_at,
    requested_staff_member_id,
    btrim(requested_customer_name),
    btrim(requested_insurer),
    btrim(requested_insurance_type),
    NULLIF(btrim(requested_policy_number), ''),
    requested_premium_amount,
    requested_brokerage_commission_amount,
    requested_employee_payout_amount,
    requested_payout_status,
    CASE
      WHEN requested_payout_status = 'paid'::public.payout_status THEN pg_catalog.now()
      ELSE NULL
    END,
    NULLIF(btrim(requested_notes), '')
  )
  RETURNING * INTO created_sale;

  INSERT INTO public.insurance_sale_audit_events (
    sale_id,
    actor_email,
    action,
    previous_snapshot,
    new_snapshot
  ) VALUES (
    created_sale.id,
    lower(btrim(actor_email)),
    'created'::public.sale_audit_action,
    NULL,
    pg_catalog.to_jsonb(created_sale)
  );

  RETURN QUERY
  SELECT
    created_sale.id,
    created_sale.created_at,
    created_sale.updated_at,
    created_sale.sold_at,
    created_sale.staff_member_id,
    staff_member.name,
    created_sale.customer_name,
    created_sale.insurer,
    created_sale.insurance_type,
    created_sale.policy_number,
    created_sale.premium_amount,
    created_sale.brokerage_commission_amount,
    created_sale.employee_payout_amount,
    created_sale.payout_status,
    created_sale.payout_paid_at,
    created_sale.notes
  FROM public.staff_members AS staff_member
  WHERE staff_member.id = created_sale.staff_member_id;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.update_insurance_sale(
  actor_email text,
  actor_subject text,
  requested_sale_id uuid,
  requested_sold_at date,
  requested_staff_member_id uuid,
  requested_customer_name text,
  requested_insurer text,
  requested_insurance_type text,
  requested_policy_number text,
  requested_premium_amount numeric,
  requested_brokerage_commission_amount numeric,
  requested_employee_payout_amount numeric,
  requested_payout_status public.payout_status,
  requested_notes text
)
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  sold_at date,
  staff_member_id uuid,
  staff_member_name varchar(150),
  customer_name varchar(150),
  insurer varchar(120),
  insurance_type varchar(64),
  policy_number varchar(80),
  premium_amount numeric(14, 2),
  brokerage_commission_amount numeric(14, 2),
  employee_payout_amount numeric(14, 2),
  payout_status public.payout_status,
  payout_paid_at timestamp with time zone,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
DECLARE
  previous_sale public.insurance_sales%ROWTYPE;
  updated_sale public.insurance_sales%ROWTYPE;
BEGIN
  IF NOT public.is_operations_admin(actor_email, actor_subject) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE id = requested_staff_member_id AND active
  ) THEN
    RAISE EXCEPTION 'active staff member required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO previous_sale
  FROM public.insurance_sales AS existing_sale
  WHERE existing_sale.id = requested_sale_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.insurance_sales AS sale
  SET
    sold_at = requested_sold_at,
    staff_member_id = requested_staff_member_id,
    customer_name = btrim(requested_customer_name),
    insurer = btrim(requested_insurer),
    insurance_type = btrim(requested_insurance_type),
    policy_number = NULLIF(btrim(requested_policy_number), ''),
    premium_amount = requested_premium_amount,
    brokerage_commission_amount = requested_brokerage_commission_amount,
    employee_payout_amount = requested_employee_payout_amount,
    payout_status = requested_payout_status,
    payout_paid_at = CASE
      WHEN requested_payout_status = 'pending'::public.payout_status THEN NULL
      WHEN previous_sale.payout_status = 'paid'::public.payout_status THEN previous_sale.payout_paid_at
      ELSE pg_catalog.now()
    END,
    notes = NULLIF(btrim(requested_notes), ''),
    updated_at = pg_catalog.now()
  WHERE sale.id = requested_sale_id
  RETURNING sale.* INTO updated_sale;

  INSERT INTO public.insurance_sale_audit_events (
    sale_id,
    actor_email,
    action,
    previous_snapshot,
    new_snapshot
  ) VALUES (
    updated_sale.id,
    lower(btrim(actor_email)),
    'updated'::public.sale_audit_action,
    pg_catalog.to_jsonb(previous_sale),
    pg_catalog.to_jsonb(updated_sale)
  );

  RETURN QUERY
  SELECT
    updated_sale.id,
    updated_sale.created_at,
    updated_sale.updated_at,
    updated_sale.sold_at,
    updated_sale.staff_member_id,
    staff_member.name,
    updated_sale.customer_name,
    updated_sale.insurer,
    updated_sale.insurance_type,
    updated_sale.policy_number,
    updated_sale.premium_amount,
    updated_sale.brokerage_commission_amount,
    updated_sale.employee_payout_amount,
    updated_sale.payout_status,
    updated_sale.payout_paid_at,
    updated_sale.notes
  FROM public.staff_members AS staff_member
  WHERE staff_member.id = updated_sale.staff_member_id;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.get_operations_summary(actor_email text, actor_subject text)
RETURNS TABLE (
  sale_count bigint,
  premium_amount numeric(14, 2),
  brokerage_commission_amount numeric(14, 2),
  employee_payout_amount numeric(14, 2),
  pending_payout_amount numeric(14, 2)
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
DECLARE
  actor public.staff_members%ROWTYPE;
BEGIN
  SELECT * INTO actor
  FROM public.staff_members AS staff_member
  WHERE staff_member.email = lower(btrim(actor_email))
    AND staff_member.access_subject = btrim(actor_subject)
    AND staff_member.active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'operations actor required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    count(*)::bigint,
    COALESCE(sum(sale.premium_amount), 0)::numeric(14, 2),
    COALESCE(sum(sale.brokerage_commission_amount), 0)::numeric(14, 2),
    COALESCE(sum(sale.employee_payout_amount), 0)::numeric(14, 2),
    COALESCE(
      sum(sale.employee_payout_amount) FILTER (
        WHERE sale.payout_status = 'pending'::public.payout_status
      ),
      0
    )::numeric(14, 2)
  FROM public.insurance_sales AS sale
  WHERE actor.role = 'administrator'::public.staff_role OR sale.staff_member_id = actor.id;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.is_operations_actor(text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.is_operations_admin(text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.is_operations_master(text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_operations_session(text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.bootstrap_operations_master(text, text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_staff_members(text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_staff_member(text, text, text, text, public.staff_role, boolean) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.update_staff_member(text, text, uuid, text, text, public.staff_role, boolean, boolean) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_insurance_sales(text, text, date, uuid, integer) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_insurance_sale(text, text, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.update_insurance_sale(text, text, uuid, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_operations_summary(text, text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_operations_session(text, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.bootstrap_operations_master(text, text, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_staff_members(text, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_staff_member(text, text, text, text, public.staff_role, boolean) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.update_staff_member(text, text, uuid, text, text, public.staff_role, boolean, boolean) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_insurance_sales(text, text, date, uuid, integer) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_insurance_sale(text, text, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.update_insurance_sale(text, text, uuid, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_operations_summary(text, text) TO bs_veritas_quote_writer;
