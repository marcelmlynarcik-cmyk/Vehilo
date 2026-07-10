# Vehilo Project Plan

Last updated: 2026-07-10

## Project Summary

Vehilo is a production-quality installable PWA for personal and multi-vehicle ownership management.

Primary product language:

- Czech first.
- Translations and multilingual UI will be added later.
- Development docs may stay in English where useful, but user-facing product copy should be Czech by default.

Positioning:

> Vehilo - All your vehicle costs, fuel, energy, service, documents and reminders in one place.

Alternative tagline:

> Know the true cost of every kilometer.

The app must feel like a real SaaS product that can be launched publicly, not a demo. It must work well on desktop and mobile and support one vehicle as well as multi-vehicle garages.

## Important Product Decision

We will not build Vehilo around mock data.

Instead, we will build the product with real data persistence from the beginning using Supabase. Temporary seed data may be used only for development/testing, but the application architecture, forms, queries, validation, auth, policies and UI states must be designed for real user-owned data from day one.

## Collaboration Status

Current phase:

- [x] Confirmed understanding of original Vehilo product scope.
- [x] Updated direction: use real Supabase data from the beginning.
- [x] Created this planning and progress document.
- [x] Updated product language direction: Czech first, translations later.
- [x] Create GitHub repository/project.
- [ ] Create or connect Vercel project. Next priority.
- [x] Create or connect Supabase project on the correct separate Supabase account.
- [ ] Define environment variables and local setup.
- [x] Scaffold Next.js application.
- [x] Implement Supabase schema and migrations.
- [ ] Implement app shell and first vertical slice.

Next session priority:

- Connect Vercel to the GitHub repository.
- Add Vercel environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SITE_URL`
- Deploy preview/production build.
- Add Vercel URL to Google OAuth Authorized JavaScript origins.
- Add Vercel `/auth/callback` URL to Supabase Auth redirect URLs.
- Update `NEXT_PUBLIC_SITE_URL` from localhost to the active Vercel URL.
- Continue with real authenticated CRUD for vehicles as the first application slice.

GitHub status:

- Repository: `https://github.com/marcelmlynarcik-cmyk/Vehilo.git`
- Branch: `main`
- First pushed commit: `222b2fe` (`Initial Vehilo app foundation`)

## Required Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts
- Supabase Auth
- Supabase Postgres
- Supabase Storage for document/photo uploads
- Supabase Row Level Security
- Vercel deployment
- GitHub repository
- PWA manifest and service-worker/offline strategy

## External Services To Set Up Together

### GitHub

Goal:

- Create a real repository for Vehilo.
- Push initial code.
- Use GitHub as source of truth for Vercel deployments.

Open decisions:

- Repository owner/account.
- Public or private.
- Repository name, likely `vehilo`.
- Branch strategy, likely `main` plus feature branches later.

Planned tasks:

- [ ] Initialize git repository if needed.
- [ ] Create `.gitignore`.
- [ ] Create initial `README.md`.
- [ ] Create GitHub repository.
- [ ] Add remote.
- [ ] Push initial commit.

### Vercel

Goal:

- Deploy Vehilo as a production web app/PWA.
- Connect GitHub repository to Vercel.
- Add environment variables for Supabase.

Open decisions:

- Vercel team/account.
- Production domain later.
- Preview deployment policy.

Planned tasks:

- [ ] Create/import Vercel project.
- [ ] Link local project to Vercel.
- [ ] Configure framework as Next.js.
- [ ] Add Supabase env vars.
- [ ] Verify preview deployment.
- [ ] Verify production deployment.

### Supabase

Goal:

- Use Supabase as the real backend from the beginning.
- Implement Auth, Postgres, Storage and Row Level Security.

Open decisions:

- Supabase organization/project. Important: this will be a different Supabase account than the currently discovered `marcelmlynarcik-1979's projects` organization.
- Region.
- Project name, likely `Vehilo`.
- Current project ref: `elqjzqufqjwiqsqqwhen`.
- Codex MCP access: active and verified.
- Auth methods for MVP.
- Whether to require email confirmation during early development.

Auth decision:

- Primary sign-in method will be Google account login.
- The public landing/sign-in page must show the Vehilo logo, concise product information and a Google sign-in action.
- Email/password is not the primary MVP path unless we explicitly add it later.

Google OAuth setup status:

- Google provider setup was completed by the user for local development.
- Current local app URL: `http://localhost:3000`.
- Current local app callback: `http://localhost:3000/auth/callback`.
- Supabase project callback used in Google Cloud: `https://elqjzqufqjwiqsqqwhen.supabase.co/auth/v1/callback`.
- Important before production/Vercel: add the final Vercel production URL to Google Authorized JavaScript origins and add the final Vercel `/auth/callback` URL to Supabase redirect URLs.
- Important after custom domain: replace Vercel URLs with the final production domain in Google Cloud, Supabase URL Configuration and `NEXT_PUBLIC_SITE_URL`.

Planned tasks:

- [x] Create Supabase project.
- [ ] Store project URL and publishable key in local env.
- [x] Configure Supabase client for browser and server usage.
- [x] Create database schema.
- [x] Enable RLS on all user-data tables.
- [x] Create owner-scoped policies.
- [x] Create Storage buckets for vehicle photos, receipts, invoices and documents.
- [x] Create Storage policies.
- [ ] Add seed/dev data only if needed for testing.
- [x] Run verification queries and policy checks.

Current Supabase state:

- MCP access works for project `elqjzqufqjwiqsqqwhen`.
- Applied migration: `20260710083940_initial_vehilo_schema`.
- Applied migration: `fix_advisor_findings`.
- Applied migration: `create_profile_on_signup`.
- Verified public tables: `profiles`, `vehicles`, `expenses`, `energy_entries`, `service_entries`, `reminders`, `documents`.
- RLS is enabled on all verified public user-data tables.

Security rules:

- Never expose Supabase service role key in frontend code.
- Use only publishable/anon key in browser.
- Every exposed table must have RLS enabled.
- Policies must restrict rows by authenticated owner, not just `TO authenticated`.
- Update policies must include both `USING` and `WITH CHECK`.
- Storage uploads must be owner-scoped.

## Product Scope

### Main Sections

- [ ] Dashboard
- [ ] Vehicles
- [ ] Vehicle detail
- [ ] Add/edit vehicle
- [ ] Expenses
- [ ] Fuel & Energy
- [ ] Service & Maintenance
- [ ] Reminders
- [ ] Documents
- [ ] Statistics
- [ ] Settings

### Navigation

Desktop:

- [ ] Sidebar navigation
- [ ] Vehilo logo
- [ ] User profile area
- [ ] Quick add button

Mobile:

- [ ] Bottom tab bar
- [ ] Home
- [ ] Vehicles
- [ ] Add
- [ ] Reminders
- [ ] More
- [ ] Add opens bottom sheet with quick actions

Mobile quick actions:

- [ ] Add fuel / charging
- [ ] Add expense
- [ ] Add service
- [ ] Add reminder
- [ ] Add vehicle
- [ ] Add document

## Supported Vehicle Powertrains

- Petrol
- Diesel
- Hybrid
- Plug-in hybrid
- Electric
- LPG
- CNG

Important UX requirement:

Vehilo must not assume every vehicle uses liters or L/100 km. Fuel, energy and consumption labels, forms and calculations must adapt by vehicle powertrain.

Examples:

- Diesel: `5.4 L/100 km`
- Petrol: `6.8 L/100 km`
- Hybrid: `4.7 L/100 km`
- Plug-in hybrid: `3.2 L/100 km + 12.5 kWh/100 km`
- Electric: `16.8 kWh/100 km`
- LPG: `L/100 km`
- CNG: `kg/100 km`

## UX And Design Direction

Target feeling:

- Modern SaaS dashboard
- Personal finance app
- Automotive garage manager
- Service history tracker
- Smart reminder app

Visual direction:

- Professional green/blue accent palette
- Practical, premium, clean UI
- No childish car graphics
- Cards, charts, badges, progress bars and dense but readable data views
- Strong desktop productivity
- Touch-friendly mobile interface

Theme support:

- [ ] Light mode
- [ ] Dark mode
- [ ] System theme

PWA support:

- [ ] Installable manifest
- [ ] App icons
- [ ] Full-screen mobile feel
- [ ] Offline placeholder state
- [ ] Install prompt placeholder
- [ ] Push notification permission placeholder
- [ ] Responsive forms and charts

Offline copy:

> You are offline. Vehilo will sync your changes when connection is restored.

Install card:

Title:

> Install Vehilo

Text:

> Add Vehilo to your home screen for faster access to your garage.

Button:

> Install app

## Supabase-Ready Data Model

This schema is the first planned backend model. We may refine names and constraints before creating the first migration.

### users / profiles

Supabase Auth owns the authenticated user record. The app should use a profile table for app preferences.

Planned table: `profiles`

Fields:

- `id uuid primary key references auth.users(id)`
- `name text`
- `email text`
- `currency text`
- `distance_unit text`
- `fuel_volume_unit text`
- `energy_unit text`
- `consumption_format text`
- `electric_consumption_format text`
- `language text`
- `theme text`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- User-editable metadata must not be used for authorization.
- Authorization should be based on `auth.uid()` matching owner columns.

### vehicles

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `name text`
- `brand text`
- `model text`
- `generation text`
- `trim text`
- `year integer`
- `vin text`
- `license_plate text`
- `powertrain_type text`
- `fuel_type text`
- `transmission text`
- `body_type text`
- `engine text`
- `power text`
- `battery_capacity_kwh numeric`
- `fuel_tank_size numeric`
- `lpg_cng_tank_size numeric`
- `purchase_date date`
- `purchase_mileage integer`
- `current_mileage integer`
- `purchase_price numeric`
- `current_value numeric`
- `currency text`
- `insurance_provider text`
- `primary_driver text`
- `status text`
- `notes text`
- `photo_url text`
- `created_at timestamptz`
- `updated_at timestamptz`

Status values:

- `active`
- `sold`
- `archived`

### expenses

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `vehicle_id uuid references vehicles(id)`
- `date date`
- `category text`
- `description text`
- `amount numeric`
- `currency text`
- `mileage integer`
- `payment_method text`
- `notes text`
- `receipt_url text`
- `created_at timestamptz`

Categories:

- Fuel
- Charging
- Service
- Maintenance
- Repairs
- Insurance
- Highway vignette
- MOT / STK / Technical inspection
- Emissions inspection
- Tires
- Car wash
- Parking
- Tolls
- Accessories
- Cleaning
- Financing / leasing
- Tax
- Depreciation
- Other

### energy_entries

Use this instead of a fuel-only table.

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `vehicle_id uuid references vehicles(id)`
- `date date`
- `mileage integer`
- `entry_type text`
- `fuel_type text`
- `quantity numeric`
- `quantity_unit text`
- `total_price numeric`
- `unit_price numeric`
- `full_tank boolean`
- `full_charge boolean`
- `fuel_station text`
- `charging_location text`
- `charging_type text`
- `charging_provider text`
- `battery_before_percent integer`
- `battery_after_percent integer`
- `driving_type text`
- `notes text`
- `created_at timestamptz`

Entry type values:

- `fuel`
- `charging`
- `lpg`
- `cng`

Fuel type values:

- `petrol`
- `diesel`
- `lpg`
- `cng`
- `electricity`

Quantity unit values:

- `liters`
- `kWh`
- `kg`
- `gallons`

Charging type values:

- `home`
- `workplace`
- `public_ac`
- `public_dc`
- `other`

### service_entries

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `vehicle_id uuid references vehicles(id)`
- `date date`
- `mileage integer`
- `service_type text`
- `provider text`
- `description text`
- `parts_changed text`
- `labor_cost numeric`
- `parts_cost numeric`
- `total_cost numeric`
- `currency text`
- `warranty_until_date date`
- `warranty_until_mileage integer`
- `invoice_url text`
- `notes text`
- `created_at timestamptz`

Service types:

- Oil change
- Oil filter
- Air filter
- Cabin filter
- Fuel filter
- Brake pads
- Brake discs
- Timing belt
- Timing chain
- Water pump
- Tires
- Battery
- Transmission oil
- Coolant
- Spark plugs
- Brake fluid
- AC service
- Suspension
- Wheel alignment
- Technical inspection
- Emissions inspection
- High-voltage battery check
- EV battery health check
- Charging system check
- General repair
- Other

### reminders

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `vehicle_id uuid references vehicles(id)`
- `type text`
- `title text`
- `category text`
- `due_date date`
- `last_done_date date`
- `last_done_mileage integer`
- `interval_days integer`
- `interval_months integer`
- `interval_years integer`
- `interval_km integer`
- `next_due_date date`
- `next_due_mileage integer`
- `notify_before_days integer`
- `notify_before_km integer`
- `status text`
- `repeat_interval text`
- `notes text`
- `created_at timestamptz`

Type values:

- `date`
- `mileage`
- `combined`

Status values:

- `ok`
- `upcoming`
- `due_soon`
- `overdue`
- `done`

### documents

Fields:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `vehicle_id uuid references vehicles(id)`
- `name text`
- `category text`
- `issue_date date`
- `expiration_date date`
- `file_url text`
- `notes text`
- `status text`
- `created_at timestamptz`

Status values:

- `valid`
- `expiring_soon`
- `expired`

Document categories:

- Registration document
- Insurance
- STK / MOT
- Emissions
- Invoice
- Service invoice
- Warranty
- Purchase contract
- Leasing contract
- Highway vignette
- Charging subscription
- Parking permit
- Tax document
- Other

### Storage Buckets

Planned buckets:

- `vehicle-photos`
- `receipts`
- `service-invoices`
- `documents`

Storage requirements:

- Files must be tied to authenticated owners.
- Upload UI must show placeholders and later real upload progress.
- Documents with expiration dates should be able to create related reminders.

## Pages And Requirements

### Dashboard

Header:

- Title: `Welcome back to Vehilo`
- Subtitle: `Track costs, maintenance, fuel, energy and reminders for all your vehicles in one place.`

Vehicle filter:

- All vehicles
- User vehicles from Supabase

Cards:

- [ ] Total vehicles
- [ ] Total monthly cost
- [ ] Total yearly cost
- [ ] Lifetime ownership cost
- [ ] Cost per kilometer
- [ ] Average fuel / energy consumption
- [ ] Upcoming reminders
- [ ] Overdue reminders
- [ ] Last fuel or charging entry
- [ ] Last service entry
- [ ] Most expensive vehicle
- [ ] Most expensive category
- [ ] Documents expiring soon
- [ ] Current total mileage

Charts:

- [ ] Monthly spending chart
- [ ] Expense breakdown by category
- [ ] Expense breakdown by vehicle
- [ ] Fuel / energy cost trend
- [ ] Consumption trend
- [ ] Cumulative ownership cost

Insights:

- [ ] Average monthly cost
- [ ] Fuel and energy percentage
- [ ] Vehicle cost per km
- [ ] Next urgent reminder
- [ ] Most expensive category

Quick actions:

- [ ] Add Vehicle
- [ ] Add Expense
- [ ] Add Fuel / Charging
- [ ] Add Service
- [ ] Add Reminder
- [ ] Add Document

### Vehicles

Vehicle cards show:

- [ ] Photo
- [ ] Nickname
- [ ] Brand
- [ ] Model
- [ ] Year
- [ ] License plate
- [ ] Current mileage
- [ ] Fuel / powertrain type
- [ ] Transmission
- [ ] Purchase price
- [ ] Purchase date
- [ ] Current estimated value
- [ ] Total expenses
- [ ] Average consumption
- [ ] Cost per kilometer
- [ ] Next important reminder
- [ ] Document status
- [ ] Status badge

Status badge values:

- Active
- Sold
- Archived

### Vehicle Detail

Tabs:

- [ ] Overview
- [ ] Expenses
- [ ] Fuel & Energy
- [ ] Service
- [ ] Reminders
- [ ] Documents
- [ ] Statistics

Header:

- [ ] Vehicle photo
- [ ] Vehicle name
- [ ] License plate
- [ ] Current mileage
- [ ] Powertrain type
- [ ] Status
- [ ] Quick actions

Overview:

- [ ] Basic vehicle information
- [ ] Current mileage
- [ ] Purchase price
- [ ] Current estimated value
- [ ] Estimated depreciation
- [ ] Ownership duration
- [ ] Total cost
- [ ] Cost per km
- [ ] Average fuel / energy consumption
- [ ] Last service
- [ ] Next service
- [ ] Upcoming reminders
- [ ] Expiring documents

Vehicle Health:

- [ ] Maintenance status
- [ ] Reminder status
- [ ] Document status
- [ ] Cost trend
- [ ] Overall status: Good, Attention needed, Critical

### Add / Edit Vehicle Form

Sections:

- [ ] Basic info
- [ ] Vehicle type
- [ ] Purchase info
- [ ] Current info
- [ ] Media

Must adapt fields by powertrain:

- Battery capacity only for electric and plug-in hybrid.
- Fuel tank size for combustion vehicles.
- LPG/CNG tank size when relevant.

### Expenses

Features:

- [ ] Real expense CRUD
- [ ] Responsive desktop table
- [ ] Mobile stacked cards
- [ ] Filters: vehicle, category, date range, amount range, search, month, year
- [ ] Summary cards
- [ ] Charts
- [ ] Add Expense modal/drawer

### Fuel & Energy

Features:

- [ ] Adapt entry form by vehicle powertrain
- [ ] Fuel tracking for petrol/diesel/hybrid
- [ ] Charging tracking for electric
- [ ] Fuel + charging tracking for plug-in hybrid
- [ ] LPG tracking
- [ ] CNG tracking
- [ ] Summary cards
- [ ] Log table/cards
- [ ] Consumption trend chart
- [ ] Price trend chart
- [ ] Monthly cost chart
- [ ] Comparison charts

Required hint:

> Vehilo adapts fuel and energy tracking based on your vehicle type.

Required fuel accuracy text:

> Consumption is calculated only between full tank records for better accuracy.

### Service & Maintenance

Features:

- [ ] Real service entry CRUD
- [ ] Timeline view
- [ ] Table view
- [ ] Cost summary
- [ ] Charts by year and category
- [ ] Vehicle-specific service history
- [ ] EV-specific de-emphasis of combustion maintenance

### Reminders

Types:

- [ ] Date-based reminders
- [ ] Mileage-based reminders
- [ ] Combined date + mileage reminders

Visual grouping:

- [ ] Overdue
- [ ] Due soon
- [ ] Upcoming
- [ ] Completed

Features:

- [ ] Progress bars for mileage reminders
- [ ] Smart suggestions by powertrain
- [ ] PWA notification placeholder

Notification copy:

> Enable push notifications to receive reminders before maintenance, inspections or document expirations.

### Documents

Features:

- [ ] Real document metadata CRUD
- [ ] Supabase Storage upload
- [ ] Documents table
- [ ] Mobile document cards
- [ ] Expiring soon documents
- [ ] Expired documents
- [ ] Documents by vehicle
- [ ] Document-to-reminder connection design

### Statistics

Features:

- [ ] Total cost of ownership
- [ ] Cost per kilometer
- [ ] Monthly average cost
- [ ] Yearly average cost
- [ ] Fuel / energy cost percentage
- [ ] Service cost percentage
- [ ] Insurance cost percentage
- [ ] Depreciation estimate
- [ ] Purchase price vs current value
- [ ] Most expensive month
- [ ] Most expensive category
- [ ] Most expensive vehicle
- [ ] Fuel / energy consumption trend
- [ ] Cost trend over time
- [ ] Expense breakdowns
- [ ] Mileage driven per month
- [ ] Fuel/electricity price trends
- [ ] Service cost trend
- [ ] Cumulative ownership cost
- [ ] Vehicle comparison

Charts:

- [ ] Line: monthly total cost
- [ ] Bar: expense categories
- [ ] Pie: cost distribution
- [ ] Line: fuel / energy consumption
- [ ] Bar: mileage per month
- [ ] Area: cumulative cost of ownership
- [ ] Bar: cost per 100 km by vehicle
- [ ] Line: depreciation over time
- [ ] Stacked: fuel vs service vs insurance vs other

### Settings

Sections:

- [ ] Profile
- [ ] Preferences
- [ ] Notifications
- [ ] App
- [ ] Privacy
- [ ] Future Monetization

Vehilo Pro card:

- Unlimited vehicles
- Advanced charts
- Document storage
- Smart reminders
- Export to PDF
- Export to Excel
- Shared family garage
- Multi-user access
- Fleet mode
- Maintenance templates
- AI insights

## Calculation Helpers

The app needs frontend calculation helpers and later database-safe equivalents where useful.

Cost calculations:

- [ ] Total cost of ownership
- [ ] Monthly cost
- [ ] Yearly cost
- [ ] Lifetime cost
- [ ] Cost per kilometer
- [ ] Average monthly cost
- [ ] Expense category percentage
- [ ] Vehicle cost comparison
- [ ] Depreciation estimate

Fuel calculations:

- [ ] Fuel consumption in L/100 km
- [ ] Fuel cost per 100 km
- [ ] Fuel cost per km
- [ ] Average fuel price
- [ ] Consumption between full tank records only

Electric calculations:

- [ ] Energy consumption in kWh/100 km
- [ ] Charging cost per 100 km
- [ ] Charging cost per km
- [ ] Average price per kWh
- [ ] Home vs public charging cost

Plug-in hybrid calculations:

- [ ] Fuel cost
- [ ] Charging cost
- [ ] Combined cost
- [ ] Fuel consumption
- [ ] Electric consumption
- [ ] Combined cost per km
- [ ] Combined cost per 100 km

LPG/CNG calculations:

- [ ] LPG consumption in L/100 km
- [ ] CNG consumption in kg/100 km
- [ ] Cost per 100 km
- [ ] Cost per km

Reminder calculations:

- [ ] Remaining days
- [ ] Remaining kilometers
- [ ] Due soon status
- [ ] Overdue status
- [ ] Progress percentage for mileage-based reminders

## Suggested Implementation Phases

### Phase 0 - Project Coordination

- [x] Confirm product understanding.
- [x] Record decision to use real data from day one.
- [x] Create planning document.
- [ ] Decide GitHub repository details.
- [ ] Decide Vercel account/team.
- [ ] Decide Supabase project details.

### Phase 1 - Scaffold And Tooling

- [ ] Create Next.js App Router project.
- [ ] Add TypeScript.
- [ ] Add Tailwind CSS.
- [ ] Add shadcn/ui.
- [ ] Add lucide-react.
- [ ] Add Recharts.
- [ ] Add Supabase packages.
- [ ] Add linting/formatting baseline.
- [ ] Add initial app metadata.
- [ ] Add PWA manifest.

### Phase 2 - Supabase Foundation

- [x] Create Supabase project.
- [ ] Configure environment variables.
- [x] Add Supabase browser client.
- [x] Add Supabase server client.
- [ ] Add auth middleware/session handling.
- [x] Create SQL schema.
- [x] Enable RLS.
- [x] Add policies.
- [x] Add Storage buckets.
- [ ] Verify CRUD access with authenticated user.

### Phase 3 - Auth And App Shell

- [ ] Public landing/sign-in page with Vehilo logo and product information.
- [ ] Google OAuth sign-in.
- [ ] Auth callback route.
- [ ] Sign in page.
- [ ] Sign up page.
- [ ] Sign out action.
- [ ] Protected app routes.
- [ ] Desktop sidebar.
- [ ] Mobile bottom navigation.
- [ ] Theme provider.
- [ ] Global quick add.
- [ ] Loading and empty state patterns.

### Phase 4 - First Real Data Vertical Slice

Recommended first slice:

- [ ] Vehicles list from Supabase.
- [ ] Add vehicle form writing to Supabase.
- [ ] Vehicle detail reading from Supabase.
- [ ] Edit vehicle.
- [ ] Delete/archive vehicle.
- [ ] RLS verification.

Reason:

Vehicles are the root entity for almost every other feature.

### Phase 5 - Ownership Cost Core

- [ ] Expenses CRUD.
- [ ] Expense filters.
- [ ] Expense summaries.
- [ ] Cost calculation helpers.
- [ ] Dashboard cost cards using real data.
- [ ] Basic statistics charts.

### Phase 6 - Fuel & Energy Core

- [ ] Energy entries CRUD.
- [ ] Powertrain-adaptive forms.
- [ ] Fuel calculations.
- [ ] Electric calculations.
- [ ] Plug-in hybrid calculations.
- [ ] LPG/CNG calculations.
- [ ] Fuel & Energy charts.

### Phase 7 - Service, Reminders, Documents

- [ ] Service entries CRUD.
- [ ] Maintenance timeline.
- [ ] Reminders CRUD.
- [ ] Reminder status calculations.
- [ ] Documents CRUD.
- [ ] Supabase Storage uploads.
- [ ] Document expiration reminders.

### Phase 8 - Advanced Dashboard And Statistics

- [ ] Full dashboard aggregation.
- [ ] Advanced statistics page.
- [ ] Vehicle comparisons.
- [ ] Insight cards.
- [ ] PWA install card.
- [ ] Offline placeholder.

### Phase 9 - Production Hardening

- [ ] Responsive QA.
- [ ] Accessibility pass.
- [ ] Empty/loading/error states.
- [ ] Validation messages.
- [ ] Database indexes.
- [ ] Supabase advisor checks.
- [ ] Vercel preview verification.
- [ ] Production deployment verification.
- [ ] README and setup docs.

## File Structure Proposal

Initial target structure:

```txt
app/
  (auth)/
  (app)/
    dashboard/
    vehicles/
    expenses/
    fuel-energy/
    service/
    reminders/
    documents/
    statistics/
    settings/
components/
  app-shell/
  charts/
  forms/
  layout/
  ui/
features/
  vehicles/
  expenses/
  energy/
  service/
  reminders/
  documents/
  statistics/
lib/
  calculations/
  supabase/
  utils/
types/
  database.ts
  domain.ts
supabase/
  migrations/
  seed.sql
docs/
  VEHILO_PROJECT_PLAN.md
```

## Data Access Strategy

Principles:

- Server components should load initial data where practical.
- Client components should be used for interactive forms, filters, dialogs and charts.
- Mutations should use server actions or route handlers where appropriate.
- Browser client should never use service role keys.
- TypeScript types should reflect Supabase schema.

Planned patterns:

- `lib/supabase/server.ts` for server Supabase client.
- `lib/supabase/client.ts` for browser Supabase client.
- `types/database.ts` generated or maintained from schema.
- Feature-level data functions for each domain.
- Validation schemas near forms, likely with Zod if added.

## Validation Requirements

General:

- Required fields clearly marked.
- Clear validation messages.
- Numeric values cannot be negative unless explicitly allowed.
- Dates should be valid and logical.
- Mileage should generally increase, with controlled exceptions.
- Currency values should use decimal-safe handling.

Vehicle-specific:

- Electric vehicles require electric consumption fields and may have battery capacity.
- Combustion vehicles should show fuel tank fields.
- LPG/CNG vehicles should show relevant tank and unit fields.
- Plug-in hybrids must support fuel and charging records.

## Initial Real Data Seed Examples

These are not mock data for the app runtime. They are candidate development seed records that can be inserted into a local or development Supabase project for testing.

Vehicles:

- Skoda Octavia Combi 2.0 TDI, 2020, diesel, 182500 km, plate `4A2 1234`
- Volkswagen Golf 1.5 TSI, 2019, petrol, 96300 km, plate `5B8 5678`
- Toyota Corolla Hybrid, 2021, hybrid, 74800 km, plate `7C1 9012`
- Tesla Model 3 Long Range, 2022, electric, 58200 km, plate `EV 2022`

Note:

- The UI should work with an empty account.
- Seed data should not be hardcoded into production UI.

## Definition Of Done

For the first launchable prototype:

- [ ] App runs locally.
- [ ] App deploys on Vercel.
- [ ] User can sign up/sign in.
- [ ] User can create vehicles in Supabase.
- [ ] User can manage expenses, energy entries, service entries, reminders and documents.
- [ ] All main pages exist and are responsive.
- [ ] Dashboard and statistics use real persisted data.
- [ ] Forms are usable on mobile.
- [ ] Charts are readable on mobile.
- [ ] PWA manifest is configured.
- [ ] Theme support works.
- [ ] RLS protects user data.
- [ ] Storage policies protect user files.
- [ ] Empty states exist for new users.
- [ ] Loading states exist for slow queries.
- [ ] Basic error handling exists.
- [ ] README explains setup.

## Open Questions

- Which GitHub account or organization should own the repository?
- Should the repository be public or private?
- Which Vercel account/team should host the project?
- Which Supabase organization should own the project?
- Which auth methods are required for MVP: email/password only, magic link, Google login?
- Should early development use email confirmation or disable it for faster testing?
- Primary app language is Czech. Later we will add translations for English, Slovak, German and Polish.
- Should currency default to EUR?
- Should distance default to kilometers?
- Do we need family/shared garage in the first release, or only later as Vehilo Pro?

## Progress Log

### 2026-07-10

- Confirmed understanding of the full Vehilo product scope.
- Updated architecture direction from mock-data prototype to real-data Supabase-first build.
- Created `docs/VEHILO_PROJECT_PLAN.md` as the project planning and progress source.
- Updated language decision: user-facing Vehilo UI will be Czech-first.
- Confirmed Supabase must be created/connected under a different account than the currently available connected organization.
- Confirmed Codex has active Supabase MCP access for project `elqjzqufqjwiqsqqwhen`.
- Applied migration `20260710083940_initial_vehilo_schema`.
- Applied advisor fix migration for `set_updated_at` search path and vehicle foreign-key indexes.
- Added Google-login profile trigger `handle_new_user` for automatic `profiles` rows.
- Verified RLS-enabled tables: `profiles`, `vehicles`, `expenses`, `energy_entries`, `service_entries`, `reminders`, `documents`.
- Added auth product decision: Google account login is the primary sign-in method; the opening page must include logo, app information and Google sign-in.
- Google OAuth was configured for local development; production/Vercel callback URL changes are tracked as a required follow-up.
- Local checks before first GitHub push: `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` passed.
- Next continuation point is Vercel setup and deployment, then production Google/Supabase URL updates.
- First commit `222b2fe` pushed to GitHub repository `marcelmlynarcik-cmyk/Vehilo`.
