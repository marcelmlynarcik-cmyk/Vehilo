create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  currency text not null default 'EUR',
  distance_unit text not null default 'kilometers',
  fuel_volume_unit text not null default 'liters',
  energy_unit text not null default 'kWh',
  consumption_format text not null default 'L/100 km',
  electric_consumption_format text not null default 'kWh/100 km',
  language text not null default 'cs',
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null,
  model text not null,
  generation text,
  trim text,
  year integer check (year is null or year between 1900 and 2100),
  vin text,
  license_plate text,
  powertrain_type text not null check (powertrain_type in ('petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'lpg', 'cng')),
  fuel_type text,
  transmission text check (transmission is null or transmission in ('manual', 'automatic')),
  body_type text,
  engine text,
  power text,
  battery_capacity_kwh numeric check (battery_capacity_kwh is null or battery_capacity_kwh >= 0),
  fuel_tank_size numeric check (fuel_tank_size is null or fuel_tank_size >= 0),
  lpg_cng_tank_size numeric check (lpg_cng_tank_size is null or lpg_cng_tank_size >= 0),
  purchase_date date,
  purchase_mileage integer check (purchase_mileage is null or purchase_mileage >= 0),
  current_mileage integer not null default 0 check (current_mileage >= 0),
  purchase_price numeric check (purchase_price is null or purchase_price >= 0),
  current_value numeric check (current_value is null or current_value >= 0),
  currency text not null default 'EUR',
  insurance_provider text,
  primary_driver text,
  status text not null default 'active' check (status in ('active', 'sold', 'archived')),
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null,
  category text not null,
  description text not null,
  amount numeric not null check (amount >= 0),
  currency text not null default 'EUR',
  mileage integer check (mileage is null or mileage >= 0),
  payment_method text,
  notes text,
  receipt_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.energy_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null,
  mileage integer not null check (mileage >= 0),
  entry_type text not null check (entry_type in ('fuel', 'charging', 'lpg', 'cng')),
  fuel_type text check (fuel_type is null or fuel_type in ('petrol', 'diesel', 'lpg', 'cng', 'electricity')),
  quantity numeric not null check (quantity >= 0),
  quantity_unit text not null check (quantity_unit in ('liters', 'kWh', 'kg', 'gallons')),
  total_price numeric not null check (total_price >= 0),
  unit_price numeric check (unit_price is null or unit_price >= 0),
  full_tank boolean,
  full_charge boolean,
  fuel_station text,
  charging_location text,
  charging_type text check (charging_type is null or charging_type in ('home', 'workplace', 'public_ac', 'public_dc', 'other')),
  charging_provider text,
  battery_before_percent integer check (battery_before_percent is null or battery_before_percent between 0 and 100),
  battery_after_percent integer check (battery_after_percent is null or battery_after_percent between 0 and 100),
  driving_type text check (driving_type is null or driving_type in ('city', 'highway', 'mixed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.service_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null,
  mileage integer not null check (mileage >= 0),
  service_type text not null,
  provider text,
  description text not null,
  parts_changed text,
  labor_cost numeric check (labor_cost is null or labor_cost >= 0),
  parts_cost numeric check (parts_cost is null or parts_cost >= 0),
  total_cost numeric not null check (total_cost >= 0),
  currency text not null default 'EUR',
  warranty_until_date date,
  warranty_until_mileage integer check (warranty_until_mileage is null or warranty_until_mileage >= 0),
  invoice_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type text not null check (type in ('date', 'mileage', 'combined')),
  title text not null,
  category text not null,
  due_date date,
  last_done_date date,
  last_done_mileage integer check (last_done_mileage is null or last_done_mileage >= 0),
  interval_days integer check (interval_days is null or interval_days >= 0),
  interval_months integer check (interval_months is null or interval_months >= 0),
  interval_years integer check (interval_years is null or interval_years >= 0),
  interval_km integer check (interval_km is null or interval_km >= 0),
  next_due_date date,
  next_due_mileage integer check (next_due_mileage is null or next_due_mileage >= 0),
  notify_before_days integer check (notify_before_days is null or notify_before_days >= 0),
  notify_before_km integer check (notify_before_km is null or notify_before_km >= 0),
  status text not null default 'upcoming' check (status in ('ok', 'upcoming', 'due_soon', 'overdue', 'done')),
  repeat_interval text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  name text not null,
  category text not null,
  issue_date date,
  expiration_date date,
  file_url text,
  notes text,
  status text not null default 'valid' check (status in ('valid', 'expiring_soon', 'expired')),
  created_at timestamptz not null default now()
);

create index if not exists vehicles_user_id_idx on public.vehicles(user_id);
create index if not exists expenses_user_vehicle_date_idx on public.expenses(user_id, vehicle_id, date desc);
create index if not exists energy_entries_user_vehicle_date_idx on public.energy_entries(user_id, vehicle_id, date desc);
create index if not exists service_entries_user_vehicle_date_idx on public.service_entries(user_id, vehicle_id, date desc);
create index if not exists reminders_user_vehicle_status_idx on public.reminders(user_id, vehicle_id, status);
create index if not exists documents_user_vehicle_status_idx on public.documents(user_id, vehicle_id, status);
create index if not exists expenses_vehicle_id_idx on public.expenses(vehicle_id);
create index if not exists energy_entries_vehicle_id_idx on public.energy_entries(vehicle_id);
create index if not exists service_entries_vehicle_id_idx on public.service_entries(vehicle_id);
create index if not exists reminders_vehicle_id_idx on public.reminders(vehicle_id);
create index if not exists documents_vehicle_id_idx on public.documents(vehicle_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_vehicles_updated_at on public.vehicles;
create trigger set_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.expenses enable row level security;
alter table public.energy_entries enable row level security;
alter table public.service_entries enable row level security;
alter table public.reminders enable row level security;
alter table public.documents enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.vehicles to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.energy_entries to authenticated;
grant select, insert, update, delete on public.service_entries to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
grant select, insert, update, delete on public.documents to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "vehicles_select_own" on public.vehicles for select to authenticated using ((select auth.uid()) = user_id);
create policy "vehicles_insert_own" on public.vehicles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "vehicles_update_own" on public.vehicles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "vehicles_delete_own" on public.vehicles for delete to authenticated using ((select auth.uid()) = user_id);

create policy "expenses_select_own" on public.expenses for select to authenticated using ((select auth.uid()) = user_id);
create policy "expenses_insert_own" on public.expenses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "expenses_update_own" on public.expenses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expenses_delete_own" on public.expenses for delete to authenticated using ((select auth.uid()) = user_id);

create policy "energy_entries_select_own" on public.energy_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "energy_entries_insert_own" on public.energy_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "energy_entries_update_own" on public.energy_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "energy_entries_delete_own" on public.energy_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "service_entries_select_own" on public.service_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "service_entries_insert_own" on public.service_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "service_entries_update_own" on public.service_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "service_entries_delete_own" on public.service_entries for delete to authenticated using ((select auth.uid()) = user_id);

create policy "reminders_select_own" on public.reminders for select to authenticated using ((select auth.uid()) = user_id);
create policy "reminders_insert_own" on public.reminders for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "reminders_update_own" on public.reminders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "reminders_delete_own" on public.reminders for delete to authenticated using ((select auth.uid()) = user_id);

create policy "documents_select_own" on public.documents for select to authenticated using ((select auth.uid()) = user_id);
create policy "documents_insert_own" on public.documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "documents_update_own" on public.documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "documents_delete_own" on public.documents for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values
  ('vehicle-photos', 'vehicle-photos', false),
  ('receipts', 'receipts', false),
  ('service-invoices', 'service-invoices', false),
  ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "vehicle_files_select_own"
on storage.objects for select to authenticated
using (
  bucket_id in ('vehicle-photos', 'receipts', 'service-invoices', 'documents')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "vehicle_files_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('vehicle-photos', 'receipts', 'service-invoices', 'documents')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "vehicle_files_update_own"
on storage.objects for update to authenticated
using (
  bucket_id in ('vehicle-photos', 'receipts', 'service-invoices', 'documents')
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id in ('vehicle-photos', 'receipts', 'service-invoices', 'documents')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "vehicle_files_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id in ('vehicle-photos', 'receipts', 'service-invoices', 'documents')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
