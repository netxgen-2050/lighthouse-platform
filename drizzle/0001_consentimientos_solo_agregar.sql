-- SQL propio (drizzle-kit no genera triggers): `consentimientos` es un libro de solo agregar (ADR-005).
-- La base rechaza UPDATE, DELETE y TRUNCATE. Si una migración posterior recrea la tabla, tiene que volver a crear estos triggers.
CREATE FUNCTION "consentimientos_rechazar"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'consentimientos es un libro de solo agregar: no se puede % ', TG_OP;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "consentimientos_solo_agregar" BEFORE UPDATE OR DELETE ON "consentimientos"
  FOR EACH ROW EXECUTE FUNCTION "consentimientos_rechazar"();--> statement-breakpoint
CREATE TRIGGER "consentimientos_sin_truncate" BEFORE TRUNCATE ON "consentimientos"
  FOR EACH STATEMENT EXECUTE FUNCTION "consentimientos_rechazar"();
