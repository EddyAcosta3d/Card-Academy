# Esquema de Base de Datos (Supabase) - Card Academy

Copia y pega el bloque correspondiente en el **SQL Editor** de tu proyecto Supabase.

## OPCIÓN A: Si la tabla NO existe (Configuración Inicial)
Usa esto si estás empezando de cero.

```sql
create table users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  role text check (role in ('Student', 'Teacher', 'Admin')) default 'Student',
  grade text,
  tokens integer default 0,
  streak integer default 0,
  assigned_subjects text[] default '{}',
  assigned_groups text[] default '{}',
  completed_tasks text[] default '{}',
  pending_tasks text[] default '{}',
  unsticked_cards text[] default '{}',
  pack_currencies jsonb default '{"pack_jacobo": 0, "pack_culiacan": 0, "pack_six_seven": 0}'::jsonb,
  daily_limits jsonb default '{"lastResetDate": "", "easyCompleted": 0, "mediumCompleted": 0, "hardCompleted": 0}'::jsonb,
  last_active timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table user_cards (
  user_id uuid references users(id) on delete cascade,
  card_id text not null,
  obtained_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, card_id)
);

-- Políticas de Seguridad (RLS)
alter table users enable row level security;
create policy "Cualquiera puede ver perfiles" on users for select using (true);
create policy "Los usuarios pueden insertar su propio perfil" on users for insert with check (auth.uid() = id);
create policy "Los usuarios pueden actualizar su propio perfil" on users for update using (auth.uid() = id);
create policy "Los admins pueden gestionar TODO" on users for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin'
);

alter table user_cards enable row level security;
create policy "Ver inventarios" on user_cards for select using (true);
create policy "Obtener cartas" on user_cards for insert with check (auth.uid() = user_id);
create policy "Borrar cartas (intercambios)" on user_cards for delete using (auth.uid() = user_id);
create policy "Admins gestionan cartas" on user_cards for all using (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin'
);
```

## OPCIÓN B: Si la tabla YA existe (Reparar / Actualizar)
Usa esto si ves errores de "column does not exist". **Este es el que probablemente necesitas ahora.**

```sql
-- Añadir columnas faltantes a la tabla users
alter table users add column if not exists username text;
alter table users add column if not exists role text default 'Student';
alter table users add column if not exists grade text;
alter table users add column if not exists tokens integer default 0;
alter table users add column if not exists streak integer default 0;
alter table users add column if not exists assigned_subjects text[] default '{}';
alter table users add column if not exists assigned_groups text[] default '{}';
alter table users add column if not exists completed_tasks text[] default '{}';
alter table users add column if not exists pending_tasks text[] default '{}';
alter table users add column if not exists unsticked_cards text[] default '{}';
alter table users add column if not exists pack_currencies jsonb default '{"pack_jacobo": 0, "pack_culiacan": 0, "pack_six_seven": 0}'::jsonb;
alter table users add column if not exists daily_limits jsonb default '{"lastResetDate": "", "easyCompleted": 0, "mediumCompleted": 0, "hardCompleted": 0}'::jsonb;
alter table users add column if not exists last_active timestamp with time zone default timezone('utc'::text, now());

-- Asegurar que username sea único si no lo es
-- alter table users add constraint users_username_key unique (username);
```

---

## OPCIÓN C: Tabla de Notificaciones (Faltante)
Si ves advertencias de que no existe la tabla `notifications` en Supabase, ejecuta este script en tu **SQL Editor**:

```sql
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas de Seguridad (RLS) para Notificaciones
alter table notifications enable row level security;

-- Cualquier usuario puede ver sus propias notificaciones
create policy "Usuarios ven sus notificaciones" on notifications
  for select using (auth.uid() = user_id);

-- Enviar notificaciones (Abierto para que profes/admins o el sistema envíe)
create policy "Cualquiera puede crear notificaciones" on notifications
  for insert with check (true);

-- Marcar como leída
create policy "Usuarios actualizan sus notificaciones" on notifications
  for update using (auth.uid() = user_id);
```

---

### Notas importantes:
1. **assigned_groups**: Es vital que esta columna sea de tipo `text[]` (array de texto).
2. **username**: Si ya tienes datos, asegúrate de que cada usuario tenga un valor en `username` antes de intentar habitilitarlo como `unique`.
