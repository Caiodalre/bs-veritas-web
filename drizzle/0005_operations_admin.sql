CREATE TYPE "public"."payout_status" AS ENUM('pending', 'paid');--> statement-breakpoint
CREATE TYPE "public"."sale_audit_action" AS ENUM('created', 'updated');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('administrator', 'employee');--> statement-breakpoint
CREATE TABLE "insurance_sale_audit_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "insurance_sale_audit_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"sale_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_email" varchar(254) NOT NULL,
	"action" "sale_audit_action" NOT NULL,
	"previous_snapshot" jsonb,
	"new_snapshot" jsonb NOT NULL,
	CONSTRAINT "insurance_sale_audit_actor_email_check" CHECK ("insurance_sale_audit_events"."actor_email" = lower(btrim("insurance_sale_audit_events"."actor_email")) and position('@' in "insurance_sale_audit_events"."actor_email") > 1)
);
--> statement-breakpoint
CREATE TABLE "insurance_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sold_at" date NOT NULL,
	"staff_member_id" uuid NOT NULL,
	"customer_name" varchar(150) NOT NULL,
	"insurer" varchar(120) NOT NULL,
	"insurance_type" varchar(64) NOT NULL,
	"policy_number" varchar(80),
	"premium_amount" numeric(14, 2) NOT NULL,
	"brokerage_commission_amount" numeric(14, 2) NOT NULL,
	"employee_payout_amount" numeric(14, 2) NOT NULL,
	"payout_status" "payout_status" DEFAULT 'pending' NOT NULL,
	"payout_paid_at" timestamp with time zone,
	"notes" text,
	CONSTRAINT "insurance_sales_customer_name_check" CHECK (char_length(btrim("insurance_sales"."customer_name")) between 2 and 150 and "insurance_sales"."customer_name" = btrim("insurance_sales"."customer_name")),
	CONSTRAINT "insurance_sales_insurer_check" CHECK (char_length(btrim("insurance_sales"."insurer")) between 2 and 120 and "insurance_sales"."insurer" = btrim("insurance_sales"."insurer")),
	CONSTRAINT "insurance_sales_insurance_type_check" CHECK (char_length(btrim("insurance_sales"."insurance_type")) between 2 and 64 and "insurance_sales"."insurance_type" = btrim("insurance_sales"."insurance_type")),
	CONSTRAINT "insurance_sales_policy_number_check" CHECK ("insurance_sales"."policy_number" is null or (char_length(btrim("insurance_sales"."policy_number")) between 1 and 80 and "insurance_sales"."policy_number" = btrim("insurance_sales"."policy_number"))),
	CONSTRAINT "insurance_sales_premium_amount_check" CHECK ("insurance_sales"."premium_amount" >= 0),
	CONSTRAINT "insurance_sales_commission_amount_check" CHECK ("insurance_sales"."brokerage_commission_amount" >= 0 and "insurance_sales"."brokerage_commission_amount" <= "insurance_sales"."premium_amount"),
	CONSTRAINT "insurance_sales_employee_payout_amount_check" CHECK ("insurance_sales"."employee_payout_amount" >= 0 and "insurance_sales"."employee_payout_amount" <= "insurance_sales"."brokerage_commission_amount"),
	CONSTRAINT "insurance_sales_payout_paid_at_check" CHECK (("insurance_sales"."payout_status" = 'paid' and "insurance_sales"."payout_paid_at" is not null) or ("insurance_sales"."payout_status" = 'pending' and "insurance_sales"."payout_paid_at" is null)),
	CONSTRAINT "insurance_sales_notes_check" CHECK ("insurance_sales"."notes" is null or (char_length(btrim("insurance_sales"."notes")) between 1 and 2000 and "insurance_sales"."notes" = btrim("insurance_sales"."notes")))
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(254) NOT NULL,
	"role" "staff_role" DEFAULT 'employee' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "staff_members_name_check" CHECK (char_length(btrim("staff_members"."name")) between 2 and 150 and "staff_members"."name" = btrim("staff_members"."name")),
	CONSTRAINT "staff_members_email_check" CHECK ("staff_members"."email" = lower(btrim("staff_members"."email")) and position('@' in "staff_members"."email") > 1)
);
--> statement-breakpoint
ALTER TABLE "insurance_sale_audit_events" ADD CONSTRAINT "insurance_sale_audit_events_sale_id_insurance_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."insurance_sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_sales" ADD CONSTRAINT "insurance_sales_staff_member_id_staff_members_id_fk" FOREIGN KEY ("staff_member_id") REFERENCES "public"."staff_members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "insurance_sale_audit_sale_occurred_idx" ON "insurance_sale_audit_events" USING btree ("sale_id","occurred_at","id");--> statement-breakpoint
CREATE INDEX "insurance_sales_staff_sold_at_id_idx" ON "insurance_sales" USING btree ("staff_member_id","sold_at","id");--> statement-breakpoint
CREATE INDEX "insurance_sales_payout_sold_at_id_idx" ON "insurance_sales" USING btree ("payout_status","sold_at","id");--> statement-breakpoint
CREATE INDEX "insurance_sales_sold_at_id_idx" ON "insurance_sales" USING btree ("sold_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_members_email_unique_idx" ON "staff_members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "staff_members_active_role_name_idx" ON "staff_members" USING btree ("active","role","name");
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.is_operations_admin(actor_email text)
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
      AND staff_member.active
      AND staff_member.role = 'administrator'::public.staff_role
  );
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.get_operations_session(actor_email text)
RETURNS TABLE (
  staff_member_id uuid,
  staff_name varchar(150),
  staff_role public.staff_role,
  bootstrap_available boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
  SELECT
    actor.id,
    actor.name,
    actor.role,
    NOT EXISTS (SELECT 1 FROM public.staff_members) AS bootstrap_available
  FROM (VALUES (1)) AS singleton(value)
  LEFT JOIN LATERAL (
    SELECT staff_member.id, staff_member.name, staff_member.role
    FROM public.staff_members AS staff_member
    WHERE staff_member.email = lower(btrim(actor_email))
      AND staff_member.active
      AND staff_member.role = 'administrator'::public.staff_role
    LIMIT 1
  ) AS actor ON true;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.bootstrap_operations_admin(actor_email text, actor_name text)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('bs_veritas_operations_bootstrap'));

  IF EXISTS (SELECT 1 FROM public.staff_members) THEN
    RETURN;
  END IF;

  RETURN QUERY
  INSERT INTO public.staff_members (name, email, role, active)
  VALUES (btrim(actor_name), lower(btrim(actor_email)), 'administrator'::public.staff_role, true)
  RETURNING *;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.list_staff_members(actor_email text)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
AS $$
BEGIN
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT staff_member.*
  FROM public.staff_members AS staff_member
  ORDER BY staff_member.active DESC, staff_member.name ASC, staff_member.id ASC;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.create_staff_member(
  actor_email text,
  requested_name text,
  requested_email text,
  requested_role public.staff_role
)
RETURNS SETOF public.staff_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
SET statement_timeout = '5s'
SET lock_timeout = '1s'
AS $$
BEGIN
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  INSERT INTO public.staff_members (name, email, role, active)
  VALUES (btrim(requested_name), lower(btrim(requested_email)), requested_role, true)
  RETURNING *;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.update_staff_member(
  actor_email text,
  staff_id uuid,
  requested_name text,
  requested_email text,
  requested_role public.staff_role,
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
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
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
    OR NOT requested_active
  ) THEN
    RAISE EXCEPTION 'an administrator cannot remove their own access' USING ERRCODE = '22023';
  END IF;

  IF current_staff.role = 'administrator'::public.staff_role
    AND current_staff.active
    AND (requested_role <> 'administrator'::public.staff_role OR NOT requested_active)
    AND (SELECT count(*) FROM public.staff_members WHERE role = 'administrator'::public.staff_role AND active) <= 1
  THEN
    RAISE EXCEPTION 'at least one active administrator is required' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  UPDATE public.staff_members AS staff_member
  SET
    name = btrim(requested_name),
    email = lower(btrim(requested_email)),
    role = requested_role,
    active = requested_active,
    updated_at = pg_catalog.now()
  WHERE staff_member.id = staff_id
  RETURNING staff_member.*;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.list_insurance_sales(
  actor_email text,
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
BEGIN
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
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
  WHERE cursor_sold_at IS NULL OR (sale.sold_at, sale.id) < (cursor_sold_at, cursor_id)
  ORDER BY sale.sold_at DESC, sale.id DESC
  LIMIT result_limit;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.create_insurance_sale(
  actor_email text,
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
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.staff_members WHERE id = requested_staff_member_id AND active) THEN
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
    CASE WHEN requested_payout_status = 'paid'::public.payout_status THEN pg_catalog.now() ELSE NULL END,
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
CREATE OR REPLACE FUNCTION public.update_insurance_sale(
  actor_email text,
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
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.staff_members WHERE id = requested_staff_member_id AND active) THEN
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
CREATE OR REPLACE FUNCTION public.get_operations_summary(actor_email text)
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
BEGIN
  IF NOT public.is_operations_admin(actor_email) THEN
    RAISE EXCEPTION 'operations administrator required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    count(*)::bigint,
    COALESCE(sum(sale.premium_amount), 0)::numeric(14, 2),
    COALESCE(sum(sale.brokerage_commission_amount), 0)::numeric(14, 2),
    COALESCE(sum(sale.employee_payout_amount), 0)::numeric(14, 2),
    COALESCE(sum(sale.employee_payout_amount) FILTER (WHERE sale.payout_status = 'pending'::public.payout_status), 0)::numeric(14, 2)
  FROM public.insurance_sales AS sale;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON TABLE public.staff_members, public.insurance_sales, public.insurance_sale_audit_events FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON TABLE public.staff_members, public.insurance_sales, public.insurance_sale_audit_events FROM bs_veritas_quote_writer;
--> statement-breakpoint
REVOKE ALL ON SEQUENCE public.insurance_sale_audit_events_id_seq FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON SEQUENCE public.insurance_sale_audit_events_id_seq FROM bs_veritas_quote_writer;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.is_operations_admin(text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_operations_session(text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.bootstrap_operations_admin(text, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_staff_members(text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_staff_member(text, text, text, public.staff_role) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.update_staff_member(text, uuid, text, text, public.staff_role, boolean) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.list_insurance_sales(text, date, uuid, integer) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.create_insurance_sale(text, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.update_insurance_sale(text, uuid, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.get_operations_summary(text) FROM PUBLIC;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_operations_session(text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.bootstrap_operations_admin(text, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_staff_members(text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_staff_member(text, text, text, public.staff_role) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.update_staff_member(text, uuid, text, text, public.staff_role, boolean) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.list_insurance_sales(text, date, uuid, integer) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.create_insurance_sale(text, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.update_insurance_sale(text, uuid, date, uuid, text, text, text, text, numeric, numeric, numeric, public.payout_status, text) TO bs_veritas_quote_writer;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.get_operations_summary(text) TO bs_veritas_quote_writer;
