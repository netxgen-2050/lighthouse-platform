-- Solo para la rama `previews` de Neon. Nunca en producción.
-- Personas de prueba (todas con email .test) para los previews. Se puede correr más de una vez.
-- Pegalo en el editor SQL de Neon, sobre la rama `previews`, después de aplicarle las migraciones (ver docs/guiones/neon-previews.md).
-- Solo agrega filas: no modifica, no borra ni vacía nada, y no escribe consentimientos.

-- Guarda: si la base ya tiene a alguien cuyo email no termina en .test, frena sin insertar nada.
do $$
begin
  if exists (select 1 from personas where lower(email) !~ '^[^@\s]+@[a-z0-9.-]+\.test$') then
    raise exception 'Esta base tiene personas que no son de prueba: este script es solo para la rama previews. No se insertó nada.';
  end if;
end
$$;

-- Segundo cinturón: aunque quien lo corra ignore el error de arriba, el insert no hace nada si hay alguien que no es de prueba.
insert into personas (email, rol, perfil, tribu_admin)
select v.email, v.rol::rol_persona, v.perfil::perfil_prueba, v.tribu_admin
from (
  values
    ('super@prueba.test', 'superadmin', 'usuario', null),
    ('admin@prueba.test', 'admin-tribu', 'usuario', 'valle'),
    ('persona@prueba.test', 'persona', 'inversor', null),
    ('a@prueba.test', 'persona', 'usuario', null),
    ('b@prueba.test', 'persona', 'usuario', null),
    ('c@prueba.test', 'persona', 'usuario', null)
) as v (email, rol, perfil, tribu_admin)
where not exists (select 1 from personas where lower(email) !~ '^[^@\s]+@[a-z0-9.-]+\.test$')
on conflict do nothing;
