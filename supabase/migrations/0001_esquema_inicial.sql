-- Presupuestador · esquema inicial
-- Una empresa (la sanitaria) con sus miembros (dueño y empleado).
-- Cada presupuesto guarda sus propios precios: cambiar la lista no toca los ya hechos.

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text,
  telefono text,
  email text,
  direccion text,
  logo_url text,
  -- tarifas de mano de obra (por día y por hora)
  oficial_dia numeric(12,2) not null default 0,
  oficial_hora numeric(12,2) not null default 0,
  medio_oficial_dia numeric(12,2) not null default 0,
  medio_oficial_hora numeric(12,2) not null default 0,
  peon_dia numeric(12,2) not null default 0,
  peon_hora numeric(12,2) not null default 0,
  -- viáticos
  precio_km numeric(12,2) not null default 0,
  precio_comida numeric(12,2) not null default 0,
  -- valores por defecto
  iva_pct numeric(5,2) not null default 22,
  validez_dias int not null default 15,
  condiciones text,
  proximo_numero int not null default 1,
  creado_en timestamptz not null default now()
);

create table public.miembros (
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null default 'empleado' check (rol in ('dueno', 'empleado')),
  primary key (empresa_id, user_id)
);
create index miembros_user_idx on public.miembros(user_id);

create table public.materiales (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nombre text not null,
  unidad text not null default 'unidad',
  precio numeric(12,2) not null default 0,
  donde_se_compra text,
  actualizado_en date not null default current_date
);
create index materiales_empresa_idx on public.materiales(empresa_id);

create table public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  numero int not null,
  fecha date not null default current_date,
  cliente_nombre text not null default '',
  cliente_telefono text,
  cliente_direccion text,
  descripcion text,
  condiciones text,
  iva_pct numeric(5,2) not null default 22,
  validez_dias int not null default 15,
  copia_de uuid references public.presupuestos(id) on delete set null,
  creado_por uuid references auth.users(id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now(),
  unique (empresa_id, numero)
);
create index presupuestos_empresa_idx on public.presupuestos(empresa_id);
create index presupuestos_copia_idx on public.presupuestos(copia_de);
create index presupuestos_creado_por_idx on public.presupuestos(creado_por);

-- Renglones: materiales, mano de obra y viáticos, con el precio congelado
create table public.presupuesto_items (
  id uuid primary key default gen_random_uuid(),
  presupuesto_id uuid not null references public.presupuestos(id) on delete cascade,
  tipo text not null check (tipo in ('material', 'mano_obra', 'viatico')),
  descripcion text not null,
  unidad text not null,
  cantidad numeric(12,3) not null default 1,
  precio_unitario numeric(12,2) not null default 0,
  material_id uuid references public.materiales(id) on delete set null,
  orden int not null default 0
);
create index items_presupuesto_idx on public.presupuesto_items(presupuesto_id);
create index items_material_idx on public.presupuesto_items(material_id);

-- ¿El usuario actual es miembro de esta empresa?
create function public.es_miembro(eid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.empresa_id = eid and m.user_id = (select auth.uid())
  );
$$;

-- Numeración correlativa por empresa (0001, 0002…), sin choques
create function public.asignar_numero() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.empresas
     set proximo_numero = proximo_numero + 1
   where id = new.empresa_id
  returning proximo_numero - 1 into new.numero;
  return new;
end;
$$;
create trigger presupuestos_numero before insert on public.presupuestos
  for each row execute function public.asignar_numero();

-- Primera vez: crea la empresa y deja al usuario como dueño
create function public.crear_empresa(p_nombre text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare eid uuid;
begin
  if (select auth.uid()) is null then raise exception 'Sin sesión'; end if;
  insert into public.empresas(nombre) values (p_nombre) returning id into eid;
  insert into public.miembros(empresa_id, user_id, rol) values (eid, (select auth.uid()), 'dueno');
  return eid;
end;
$$;
revoke execute on function public.crear_empresa(text) from anon, public;
grant execute on function public.crear_empresa(text) to authenticated;
revoke execute on function public.asignar_numero() from anon, authenticated, public;

-- Seguridad por filas: cada uno ve solo lo de su empresa
alter table public.empresas enable row level security;
alter table public.miembros enable row level security;
alter table public.materiales enable row level security;
alter table public.presupuestos enable row level security;
alter table public.presupuesto_items enable row level security;

create policy "ver su empresa" on public.empresas for select to authenticated
  using (public.es_miembro(id));
create policy "editar su empresa" on public.empresas for update to authenticated
  using (public.es_miembro(id)) with check (public.es_miembro(id));

create policy "ver miembros de su empresa" on public.miembros for select to authenticated
  using (public.es_miembro(empresa_id));

create policy "materiales de su empresa" on public.materiales for all to authenticated
  using (public.es_miembro(empresa_id)) with check (public.es_miembro(empresa_id));

create policy "presupuestos de su empresa" on public.presupuestos for all to authenticated
  using (public.es_miembro(empresa_id)) with check (public.es_miembro(empresa_id));

create policy "items de su empresa" on public.presupuesto_items for all to authenticated
  using (exists (select 1 from public.presupuestos p
                 where p.id = presupuesto_id and public.es_miembro(p.empresa_id)))
  with check (exists (select 1 from public.presupuestos p
                 where p.id = presupuesto_id and public.es_miembro(p.empresa_id)));
