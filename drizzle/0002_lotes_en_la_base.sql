CREATE TYPE "public"."opcion_compra" AS ENUM('solo-lote', 'modular', 'familiar', 'amplia');--> statement-breakpoint
CREATE TYPE "public"."reserva_evento" AS ENUM('reserva', 'paga', 'deshace');--> statement-breakpoint
CREATE TABLE "bitacora" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" uuid NOT NULL,
	"ruta" text NOT NULL,
	"tipo" text NOT NULL,
	"clave" text NOT NULL,
	"mostrado" text NOT NULL,
	"huella" text NOT NULL,
	"borrador" boolean DEFAULT false NOT NULL,
	"idioma" text,
	"mostrado_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contactos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" uuid NOT NULL,
	"motivo" text NOT NULL,
	"referencia" text,
	"canal" text NOT NULL,
	"momento" text,
	"mensaje" text,
	"destino" text,
	"estado_mostrado" text,
	"origen" jsonb,
	"creado_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" uuid NOT NULL,
	"hecho_por" uuid NOT NULL,
	"lote_id" text NOT NULL,
	"evento" "reserva_evento" NOT NULL,
	"opcion" "opcion_compra",
	"vio" jsonb,
	"origen" jsonb,
	"registrado_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservas_reserva_con_opcion_y_vio" CHECK ("reservas"."evento" <> 'reserva' OR ("reservas"."opcion" IS NOT NULL AND "reservas"."vio" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "personas" ADD COLUMN "origen" jsonb;--> statement-breakpoint
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactos" ADD CONSTRAINT "contactos_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_hecho_por_personas_id_fk" FOREIGN KEY ("hecho_por") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bitacora_persona_tipo_clave" ON "bitacora" USING btree ("persona_id","tipo","clave","huella","mostrado_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "contactos_creado" ON "contactos" USING btree ("creado_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "reservas_lote_hora" ON "reservas" USING btree ("lote_id","registrado_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "reservas_persona_hora" ON "reservas" USING btree ("persona_id","registrado_at" DESC NULLS LAST);--> statement-breakpoint
-- SQL propio (drizzle-kit no genera triggers): `reservas` y `bitacora` son libros de solo agregar (ADR-001).
-- La base rechaza UPDATE, DELETE y TRUNCATE. Si una migración posterior recrea alguna de las dos tablas, tiene que volver a
-- crear sus dos triggers (`<tabla>_solo_agregar` y `<tabla>_sin_truncate`) con la función `libro_rechazar`.
-- `contactos` NO es un libro: la persona puede borrar los suyos (Ley 25.326, art. 16).
CREATE FUNCTION "libro_rechazar"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% es un libro de solo agregar: no se puede %', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "reservas_solo_agregar" BEFORE UPDATE OR DELETE ON "reservas"
  FOR EACH ROW EXECUTE FUNCTION "libro_rechazar"();--> statement-breakpoint
CREATE TRIGGER "reservas_sin_truncate" BEFORE TRUNCATE ON "reservas"
  FOR EACH STATEMENT EXECUTE FUNCTION "libro_rechazar"();--> statement-breakpoint
CREATE TRIGGER "bitacora_solo_agregar" BEFORE UPDATE OR DELETE ON "bitacora"
  FOR EACH ROW EXECUTE FUNCTION "libro_rechazar"();--> statement-breakpoint
CREATE TRIGGER "bitacora_sin_truncate" BEFORE TRUNCATE ON "bitacora"
  FOR EACH STATEMENT EXECUTE FUNCTION "libro_rechazar"();