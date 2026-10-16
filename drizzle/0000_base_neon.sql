CREATE TYPE "public"."canal_consentimiento" AS ENUM('alta', 'al-entrar', 'nueva-version', 'mis-datos');--> statement-breakpoint
CREATE TYPE "public"."evento_consentimiento" AS ENUM('acepta', 'retira');--> statement-breakpoint
CREATE TYPE "public"."idioma_consentimiento" AS ENUM('es', 'en');--> statement-breakpoint
CREATE TYPE "public"."perfil_prueba" AS ENUM('usuario', 'inversor', 'comunidad');--> statement-breakpoint
CREATE TYPE "public"."proveedor_login" AS ENUM('privy', 'neon-auth');--> statement-breakpoint
CREATE TYPE "public"."rol_persona" AS ENUM('superadmin', 'admin-tribu', 'persona');--> statement-breakpoint
CREATE TYPE "public"."tipo_consentimiento" AS ENUM('politica', 'terminos', 'sensibles', 'novedades');--> statement-breakpoint
CREATE TABLE "cambios_de_rol" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" uuid NOT NULL,
	"cambiado_por" uuid NOT NULL,
	"campo" text NOT NULL,
	"valor_anterior" text,
	"valor_nuevo" text,
	"cambiado_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consentimientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" uuid NOT NULL,
	"tipo" "tipo_consentimiento" NOT NULL,
	"evento" "evento_consentimiento" NOT NULL,
	"version" text NOT NULL,
	"canal" "canal_consentimiento",
	"idioma" "idioma_consentimiento",
	"registrado_at" timestamp with time zone DEFAULT now() NOT NULL,
	"aceptado_en_cliente" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cuentas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona_id" uuid NOT NULL,
	"proveedor" "proveedor_login" NOT NULL,
	"id_externo" text NOT NULL,
	"email_verificado" text NOT NULL,
	"vinculada_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cuentas_proveedor_id_externo" UNIQUE("proveedor","id_externo"),
	CONSTRAINT "cuentas_persona_proveedor" UNIQUE("persona_id","proveedor")
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"nombre" text,
	"rol" "rol_persona" DEFAULT 'persona' NOT NULL,
	"perfil" "perfil_prueba" DEFAULT 'usuario' NOT NULL,
	"tribu_admin" text,
	"acceso" boolean DEFAULT true NOT NULL,
	"creada_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cambiada_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cambios_de_rol" ADD CONSTRAINT "cambios_de_rol_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cambios_de_rol" ADD CONSTRAINT "cambios_de_rol_cambiado_por_personas_id_fk" FOREIGN KEY ("cambiado_por") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentimientos" ADD CONSTRAINT "consentimientos_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_persona_id_personas_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."personas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consentimientos_persona_tipo_hora" ON "consentimientos" USING btree ("persona_id","tipo","registrado_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "personas_email_minusculas" ON "personas" USING btree (lower("email"));