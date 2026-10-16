import { sql } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, text, timestamp, uniqueIndex, unique, uuid } from "drizzle-orm/pg-core";

/**
 * Esquema de la base (Neon Postgres). La base cambia solo por migraciones (`pnpm db:generate`).
 * Identidad propia (ADR-009): `personas.id` es el id de NetX; el proveedor de login vive en `cuentas`.
 */

export const rolPersona = pgEnum("rol_persona", ["superadmin", "admin-tribu", "persona"]);
export const perfilPrueba = pgEnum("perfil_prueba", ["usuario", "inversor", "comunidad"]);
export const proveedorLogin = pgEnum("proveedor_login", ["privy", "neon-auth"]);
export const tipoConsentimiento = pgEnum("tipo_consentimiento", ["politica", "terminos", "sensibles", "novedades"]);
export const eventoConsentimiento = pgEnum("evento_consentimiento", ["acepta", "retira"]);
export const canalConsentimiento = pgEnum("canal_consentimiento", ["alta", "al-entrar", "nueva-version", "mis-datos"]);
export const idiomaConsentimiento = pgEnum("idioma_consentimiento", ["es", "en"]);

export const personas = pgTable(
  "personas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    nombre: text("nombre"),
    rol: rolPersona("rol").notNull().default("persona"),
    perfil: perfilPrueba("perfil").notNull().default("usuario"),
    /** Tribu que administra; hoy solo `valle`. */
    tribuAdmin: text("tribu_admin"),
    acceso: boolean("acceso").notNull().default(true),
    creadaAt: timestamp("creada_at", { withTimezone: true }).notNull().defaultNow(),
    cambiadaAt: timestamp("cambiada_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("personas_email_minusculas").on(sql`lower(${t.email})`)],
);

export const cuentas = pgTable(
  "cuentas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id, { onDelete: "restrict" }),
    proveedor: proveedorLogin("proveedor").notNull(),
    /** Id del usuario en el proveedor (Privy: `did:privy:…`). Dato personal. */
    idExterno: text("id_externo").notNull(),
    /** Constancia del email que el proveedor verificó al vincular; el email vigente es `personas.email`. Dato personal. */
    emailVerificado: text("email_verificado").notNull(),
    vinculadaAt: timestamp("vinculada_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("cuentas_proveedor_id_externo").on(t.proveedor, t.idExterno),
    unique("cuentas_persona_proveedor").on(t.personaId, t.proveedor),
  ],
);

/** Auditoría de roles y accesos: quién cambió qué de quién y cuándo. Libro de solo agregar (nunca update ni delete). */
export const cambiosDeRol = pgTable("cambios_de_rol", {
  id: uuid("id").primaryKey().defaultRandom(),
  personaId: uuid("persona_id")
    .notNull()
    .references(() => personas.id, { onDelete: "restrict" }),
  cambiadoPor: uuid("cambiado_por")
    .notNull()
    .references(() => personas.id, { onDelete: "restrict" }),
  /** `alta`, `rol`, `perfil`, `tribu_admin` o `acceso`. */
  campo: text("campo").notNull(),
  valorAnterior: text("valor_anterior"),
  valorNuevo: text("valor_nuevo"),
  cambiadoAt: timestamp("cambiado_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Libro de solo agregar (ADR-005): la base rechaza UPDATE, DELETE y TRUNCATE (triggers en la migración escrita a mano).
 * Si una migración posterior recrea la tabla, tiene que volver a crear los triggers `consentimientos_solo_agregar` y
 * `consentimientos_sin_truncate`. Forma: `consentimiento-alta` design §7.1.
 */
export const consentimientos = pgTable(
  "consentimientos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personaId: uuid("persona_id")
      .notNull()
      .references(() => personas.id, { onDelete: "restrict" }),
    tipo: tipoConsentimiento("tipo").notNull(),
    evento: eventoConsentimiento("evento").notNull(),
    version: text("version").notNull(),
    canal: canalConsentimiento("canal"),
    /** Nulo = español. */
    idioma: idiomaConsentimiento("idioma"),
    registradoAt: timestamp("registrado_at", { withTimezone: true }).notNull().defaultNow(),
    /** Hora informativa del navegador. */
    aceptadoEnCliente: timestamp("aceptado_en_cliente", { withTimezone: true }),
  },
  (t) => [index("consentimientos_persona_tipo_hora").on(t.personaId, t.tipo, t.registradoAt.desc())],
);
