# Vehilo Project Plan

Last updated: 2026-07-23

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

Launch audit / paid-launch readiness decision:

- Launch audit, legal/accounting/security paid-launch readiness and real payment activation are intentionally deferred until the user explicitly asks to start that final phase.
- Do not prioritize Phase A-G launch readiness work before then; continue product feature work, analytics, records, dashboard/statistics and remaining core app flows first.
- The launch readiness section remains in this plan as the final pre-launch checklist, not as the next implementation priority.

Analytics verification rule:

- Every calculation, chart, metric card and statistics view must be verified against the user's real Supabase data before being considered complete.
- Verification should include concrete source rows or aggregate SQL results from the live project, especially for imported Golf data and newly entered records.
- Mock or empty-state testing is not enough for analytics work; it can supplement but not replace real-data validation.

## Collaboration Status

Current phase:

- [x] Confirmed understanding of original Vehilo product scope.
- [x] Updated direction: use real Supabase data from the beginning.
- [x] Created this planning and progress document.
- [x] Updated product language direction: Czech first, translations later.
- [x] Create GitHub repository/project.
- [x] Create or connect Vercel project.
- [x] Create or connect Supabase project on the correct separate Supabase account.
- [x] Define environment variables and local setup.
- [x] Scaffold Next.js application.
- [x] Implement Supabase schema and migrations.
- [x] Implement app shell baseline.
- [ ] Implement first real data vertical slice.
- [x] Add installable PWA shell, manifest, service worker, offline page and mobile icons.
- [x] Imported the Golf vehicle data for the first real application record.
- [x] Locked the current app visual direction; do not revisit general styling except for future light mode support.

Next session priority:

- Continue Phase 6 with refined fuel/electric/PHEV/LPG/CNG statistics and real charts.
- Keep verifying every Fuel & Energy aggregate against real Supabase data before marking analytics complete.
- Then continue remaining ownership/service/dashboard statistics work without reworking the established app visual design.
- Do not start launch audit / paid-launch readiness until the user explicitly asks for that final phase.

Mobile/UX verification:

- [x] Expense filters on mobile have visible labels/placeholders; users do not need to open a dropdown to know what it filters.
- [x] Mobile Expense filter text field no longer stretches outside the viewport.
- [x] Chart left padding on mobile was reduced.
- [x] Expense cost per km no longer reproduces as `0 Kč/km`; verified against current real Supabase mileage and expense data for Golfík.
- [x] Hamburger menu closes after selecting a navigation item.
- [x] Fuel & Energy chart tooltips use Czech labels instead of generic `value`.
- [x] Fuel & Energy unit labels match the selected record units; diesel no longer shows `kWh` in the price-per-unit chart.
- [x] Vehicle filters display the vehicle name after selection, not the raw vehicle UUID.
- [x] Vehicle detail cost cards include Expenses, not only fuel/service related cards.
- [x] Vehicle detail cost cards are clickable and navigate to the relevant filtered records.
- [x] Vehicle detail tab bar (`Přehled`, `Výdaje`, `Palivo`, etc.) no longer floats/moves vertically while swiping on mobile.
- [x] Visual mobile verification completed on 2026-07-23; current mobile UX is acceptable.
- [x] Record cards on Expenses, Fuel & Energy and Service pages should be clickable to open a record detail view.
- [x] Define and implement record detail views for Expense, Fuel/Energy and Service entries.
- [x] Expense entries must support uploading a receipt/document/photo attachment.
- [x] Service entries must support uploading an invoice/document/photo attachment.

Latest progress:

- [x] Fuel & Energy create/edit/delete is available from the page and quick add.
- [x] Expense create/edit/delete is available from the page and quick add.
- [x] Service create/edit/delete is available from the page and quick add.
- [x] Expense and Service forms support a custom category/type directly while filling the form.
- [x] Service type options are powertrain-aware, so EVs do not show combustion-only items like turbo or timing belt.
- [x] STK is treated as an expense/document concept, not as a service type.
- [x] Payment method was removed from the Expense form as unnecessary.
- [x] Form fields were made visually clearer with stronger borders and contrast.
- [x] Expense filters and Expense charts are wired to real data and verified against Supabase.
- [x] On mobile, filters and charts should appear before long record lists so they are not buried below history.
- [x] Long record lists now show the latest 10 records first, with older records available through native expansion.
- [x] Mobile bottom navigation was tightened so the bar is anchored to the bottom instead of visually floating with safe-area padding.
- [x] Mobile navigation now includes a hamburger Menu sheet with access to all sections, including Expenses, Fuel & Energy and Service.
- [x] Expense, Fuel/Energy and Service entries now have detail views and record links from list/detail surfaces.
- [x] Service filters and Service charts are implemented and verified against real Supabase aggregate data.

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

- Vercel team/account: `marcelmlynarcik-1979's projects` (`team_K6xIotMnfzvPpYLZQzqYFmGR`).
- Production domain later.
- Preview deployment policy.

Planned tasks:

- [x] Create/import Vercel project.
- [x] Link local project to Vercel.
- [x] Configure framework as Next.js.
- [x] Add Supabase env vars.
- [ ] Verify preview deployment.
- [x] Verify production deployment.

Current Vercel state:

- Project: `vehilo`
- Project ID: `prj_O4cSERGTJwVVtnUISRBJYnY7q91Q`
- Production alias: `https://vehilo-six.vercel.app`
- Latest verified production deployment: `dpl_E6HaQUZgPoxYod1coWQwsLBNLMYN`
- Deployment status: `READY`
- HTTP verification: production alias returns `200`.
- Production and preview `NEXT_PUBLIC_SITE_URL` are set to `https://vehilo-six.vercel.app`.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` are configured for Vercel Production, Preview and Development.
- GitHub repository connection is completed.
- Google OAuth Authorized JavaScript origins include the Vercel production URL.
- Supabase Auth redirect URLs include the Vercel `/auth/callback` URL.

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
- Current Vercel production URL: `https://vehilo-six.vercel.app`.
- Current Vercel production callback: `https://vehilo-six.vercel.app/auth/callback`.
- Supabase project callback used in Google Cloud: `https://elqjzqufqjwiqsqqwhen.supabase.co/auth/v1/callback`.
- Important before production/Vercel: add the final Vercel production URL to Google Authorized JavaScript origins and add the final Vercel `/auth/callback` URL to Supabase redirect URLs.
- Important after custom domain: replace Vercel URLs with the final production domain in Google Cloud, Supabase URL Configuration and `NEXT_PUBLIC_SITE_URL`.

Planned tasks:

- [x] Create Supabase project.
- [x] Store project URL and publishable key in local env.
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
- [x] Single centered add button opens bottom sheet with quick actions

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

Status:

- Current dark app visual direction is approved and should be treated as locked.
- Future visual work should be limited to feature-specific UI needs and later light mode support.

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
- [x] Dark mode
- [ ] System theme

PWA support:

- [x] Installable manifest
- [x] App icons
- [x] Full-screen mobile feel
- [x] Offline placeholder state
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
- Vehicle photo upload uses private Supabase Storage with local preview, replace and remove controls.
- Upload UI for documents/receipts/invoices must show placeholders and later real upload progress.
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

- [x] Basic info
- [x] Vehicle type
- [x] Purchase info
- [x] Current info
- [x] Media
- [x] Vehicle photo upload from device
- [x] Vehicle photo preview before save
- [x] Vehicle photo replace/remove controls
- [x] Server Action upload limit adjusted for mobile photos up to 8 MB
- [x] Client-side vehicle photo resizing before upload for large mobile photos

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
- [ ] Receipt/document/photo upload on create/edit.
- [ ] Receipt/document/photo preview and link from expense detail.

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
- [ ] Invoice/document/photo upload on create/edit.
- [ ] Invoice/document/photo preview and link from service detail.

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

- [x] Vehicles list from Supabase.
- [x] Add vehicle form writing to Supabase.
- [x] Vehicle detail reading from Supabase.
- [x] Edit vehicle.
- [x] Archive vehicle.
- [x] Vehicle photo upload to private Supabase Storage.
- [x] Vehicle photo signed URL rendering.
- [ ] Verify Golf flow in the live UI.
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

- [x] Energy entries CRUD.
- [x] Powertrain-adaptive forms.
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

## Paid Subscription Launch Readiness

This section prepares Vehilo for future public operation as a paid monthly PWA service for consumers in the Czech Republic.

Important boundary:

- This is a product, engineering, security and compliance planning backlog, not legal or tax advice.
- Legal documents must be written or reviewed before launch by a Czech lawyer.
- Tax, accounting, VAT and document-format decisions must be checked before launch with a Czech accountant.
- No production code, database schema, payment integration or legal text should be implemented from this section until the relevant task is explicitly selected for implementation.
- Operator identity values must be configurable, not hardcoded in multiple places. Do not invent or commit name, IČO, address, trade-register text, VAT status or other legal identity values until confirmed.

Commercial assumptions for planning:

- Target launch market: Czech Republic.
- Target users: private individuals / consumers.
- Product: Vehilo PWA for vehicle, cost, fuel/charging, service, document and reminder management.
- Initial price: `30 Kč` per user per month.
- Billing model: monthly auto-renewing subscription.
- Trial: 14 days.
- Currency: CZK.
- Payments: external payment gateway, provider not selected yet.
- Card numbers and payment credentials must never be stored in Vehilo database.

### Current Audit Snapshot

Project structure:

- Next.js App Router app with public landing page at `src/app/page.tsx`.
- Protected app group under `src/app/(app)` with dashboard, vehicles, expenses, fuel-energy, service, reminders, documents, statistics and settings.
- UI components live under `src/components`, domain types under `src/types`, Supabase clients under `src/lib/supabase`, data loaders under `src/lib/data`, calculations under `src/lib/calculations`.
- Main planning source is this document: `docs/VEHILO_PROJECT_PLAN.md`.

Database and storage:

- Supabase schema exists in `supabase/schema.sql`.
- Current app tables: `profiles`, `vehicles`, `expenses`, `energy_entries`, `service_entries`, `reminders`, `documents`.
- RLS is enabled on current user-owned public tables.
- Owner-scoped policies use `(select auth.uid()) = user_id` or profile `id`.
- Private Storage buckets exist for `vehicle-photos`, `receipts`, `service-invoices` and `documents`.
- Storage policies restrict objects by first path segment matching the authenticated user id.
- No subscription, payment, legal-document, consent, export, account-deletion, webhook or audit-log tables exist yet.

Authentication:

- Google OAuth is the primary sign-in method.
- Supabase SSR client handles auth cookies.
- Auth callback exchanges OAuth code and redirects to the app.
- Settings page can update profile name and preferences.
- Email/password, password reset, active session management, MFA, account deletion and export flows are not implemented.

PWA:

- Manifest exists at `public/manifest.json` with `standalone` display and Czech metadata.
- Service worker exists at `public/sw.js`.
- Service worker registers only in production through `ServiceWorkerProvider`.
- Offline fallback page exists.
- Current service worker caches static app assets and does not intentionally cache user API responses.
- No update notification, background sync, push subscriptions, stale-version handling or local sensitive-data wipe flow exists yet.

External services currently visible in the project:

- Vercel: hosting and deployment.
- GitHub: source repository.
- Supabase: Auth, Postgres and Storage.
- Google OAuth: identity provider.
- No payment gateway, transactional email provider, analytics, marketing tracking, error monitoring, push notification provider or AI service is currently integrated in code.

Cookies and local storage:

- Supabase auth cookies are used through `@supabase/ssr`.
- The current app code search found no explicit `localStorage`, `sessionStorage`, `indexedDB`, analytics SDK, marketing SDK, error tracking SDK or push notification use.
- Service worker cache is used for offline fallback and static assets.

Existing partial coverage:

- Private user data model and RLS already cover core garage records.
- Private Supabase Storage buckets and signed/private file paths already support vehicle photos, receipts and service invoices.
- Public landing page and protected app shell already exist.
- Settings page already has profile and preference editing.
- PWA manifest, icons, service worker registration and offline fallback already exist.

Largest gaps before paid public launch:

- No legal pages, operator identity configuration or legal-document version acceptance.
- No privacy/GDPR process for export, deletion, retention, processors or incident response.
- No subscription model, checkout, billing status, payment history, cancellation or webhook processing.
- No transactional email system.
- No admin/support tooling or audit logs.
- No staging environment/payment sandbox plan is documented as launch-ready.
- PWA offline and push behavior is not yet safe enough for reminders and paid production use.

### Task Format For This Section

Each task below uses this compact format:

- Name: task title.
- Description: what must be planned or built later.
- Reason: why it matters.
- Priority: `P0 – Launch blocker`, `P1 – Nutné krátko po spustení`, `P2 – Dôležité zlepšenie`, or `P3 – Budúce rozšírenie`.
- Phase: A-G.
- Dependencies: required earlier decisions or work.
- Impacted parts: likely files, modules, services or documents.
- Risk: legal, security, privacy, billing, UX or operational risk.
- Acceptance: clear done criteria.
- Status: planned / in progress / done.
- Blocks launch: yes/no.

### Phase A - Audit Aktuálneho Stavu

- Name: Complete launch audit baseline.
  Description: Record current architecture, auth, database, storage, PWA behavior, external services, legal pages and plan status in this document.
  Reason: Paid launch work needs a stable baseline before adding subscription and legal workflows.
  Priority: P0 – Launch blocker.
  Phase: A.
  Dependencies: Current repository audit.
  Impacted parts: `docs/VEHILO_PROJECT_PLAN.md`, `README.md`, `src/app`, `supabase/schema.sql`, `public/manifest.json`, `public/sw.js`.
  Risk: Missing launch blockers if the current state is assumed instead of audited.
  Acceptance: Audit snapshot lists current implemented features, gaps, external providers and PWA/storage/auth state.
  Status: planned.
  Blocks launch: yes.

- Name: External provider inventory audit.
  Description: Create and maintain a central inventory of all real providers used by Vehilo.
  Reason: Privacy policy, DPA tracking, incident response and vendor risk management depend on knowing every processor/subprocessor.
  Priority: P0 – Launch blocker.
  Phase: A.
  Dependencies: Provider selection for payments, email, analytics, monitoring and push.
  Impacted parts: `docs`, future provider config, Vercel, Supabase, Google OAuth, GitHub, future payment/email/monitoring/push providers.
  Risk: Undocumented processors and cross-border transfers.
  Acceptance: Inventory includes company name, purpose, data types, processing country, DPA availability/link, terms link, retention, opt-out/shutdown option and incident contact/procedure for hosting, database, auth, storage, payments, email, analytics, monitoring, push, AI and backups as applicable.
  Status: planned.
  Blocks launch: yes.

- Name: Cookies and storage audit.
  Description: Audit cookies, Local Storage, Session Storage, IndexedDB, service worker cache, analytics, marketing tools, error tracking and user monitoring.
  Reason: Consent and cookie policy must distinguish necessary PWA/auth storage from analytics/marketing storage.
  Priority: P0 – Launch blocker.
  Phase: A.
  Dependencies: Final provider choices and final PWA behavior.
  Impacted parts: `src/lib/supabase`, `src/components/providers/service-worker-provider.tsx`, `public/sw.js`, future analytics/error monitoring modules.
  Risk: Non-technical tracking before valid consent or caching sensitive data locally.
  Acceptance: Documented categories for technical and non-technical storage, plus decision whether consent banner is required.
  Status: planned.
  Blocks launch: yes.

- Name: Supabase security audit.
  Description: Audit all RLS policies, Storage policies, database functions, grants and server operations before paid launch.
  Reason: Consumers must not be able to read or mutate another user's vehicles, files, subscriptions or account records.
  Priority: P0 – Launch blocker.
  Phase: A.
  Dependencies: Final schema for subscriptions/legal/account deletion; Supabase advisors.
  Impacted parts: `supabase/schema.sql`, future migrations, `src/lib/data`, server actions.
  Risk: BOLA/IDOR, public file exposure, service-role leakage, stale policies.
  Acceptance: Tests prove each user can only access own rows/files; storage signed URLs are time-limited; no service key is exposed in frontend; logs do not contain secrets or sensitive document contents.
  Status: planned.
  Blocks launch: yes.

### Phase B - Právny A Dátový Základ

- Name: Central operator identity configuration.
  Description: Design a single configurable source for operator identity values: name/business name, IČO, registered office/place of business, contact email, optional phone, trade-register entry text and VAT payer status.
  Reason: Public pages, emails, invoices, terms and privacy documents need consistent operator details without hardcoding values across the app.
  Priority: P0 – Launch blocker.
  Phase: B.
  Dependencies: Confirmed legal operator details and accounting/VAT status.
  Impacted parts: future `src/lib/legal` or config module, legal pages, email templates, invoice/receipt generation, admin settings.
  Risk: Incorrect or inconsistent legal identity shown to consumers.
  Acceptance: One configurable source feeds all operator displays; no duplicate hardcoded identity values; placeholders remain until verified.
  Status: planned.
  Blocks launch: yes.

- Name: Public legal information pages.
  Description: Plan publicly reachable Czech pages/sections for Kontakt, Provozovatel and Právní informace.
  Reason: Consumers must clearly know who operates the service and how to contact the operator.
  Priority: P0 – Launch blocker.
  Phase: B.
  Dependencies: Central operator identity configuration.
  Impacted parts: future public routes under `src/app`, landing footer/navigation, SEO metadata.
  Risk: Missing operator transparency; consumer trust and compliance issue.
  Acceptance: Pages are accessible without login and render only configured verified operator values.
  Status: planned.
  Blocks launch: yes.

- Name: Terms of service page and legal review.
  Description: Create a public Czech terms page covering service description, device/internet requirements, supported browsers/devices, price, billing period, trial, auto-renewal, next payment date, cancellation, refunds, consumer withdrawal, complaints, outages/maintenance, updates, user-entered data responsibility, account termination, post-subscription data handling, ADR and operator contact.
  Reason: A paid consumer subscription needs clear contractual terms before checkout.
  Priority: P0 – Launch blocker.
  Phase: B.
  Dependencies: Operator identity, subscription process, cancellation process, refund policy, legal review.
  Impacted parts: future `/obchodni-podminky` route, checkout page, legal acceptance records, email templates.
  Risk: Invalid or unclear consumer contract terms.
  Acceptance: Lawyer-reviewed Czech terms are public, versioned and linked from checkout and footer.
  Status: planned.
  Blocks launch: yes.

- Name: Legal document versioning and acceptance.
  Description: Plan version tracking for terms and privacy policy including version number, effective date, user acceptance date and accepted version per user.
  Reason: Vehilo must prove which legal text a user accepted before using paid service.
  Priority: P0 – Launch blocker.
  Phase: B.
  Dependencies: Database model design for `legal_documents` and `legal_acceptances`.
  Impacted parts: future DB schema, checkout, account settings, admin legal document management.
  Risk: Unable to evidence valid acceptance after disputes or legal changes.
  Acceptance: Every required legal document has a version and each user's acceptance is recorded immutably enough for audit.
  Status: planned.
  Blocks launch: yes.

- Name: Privacy policy page and GDPR review.
  Description: Create public Czech privacy policy covering profile/name/email/auth data, vehicles, license plate, VIN, service records, costs, fuel/charging, photos, receipts, invoices, service documents, subscription data, logs, IP/device/browser info and support communication data.
  Reason: Users need transparent information about personal data processing before using the service.
  Priority: P0 – Launch blocker.
  Phase: B.
  Dependencies: Provider inventory, retention policy, security architecture, legal review.
  Impacted parts: future `/ochrana-osobnich-udaju` route, checkout, account settings, support process.
  Risk: GDPR transparency and lawful-basis failures.
  Acceptance: Policy documents purposes, legal bases, retention periods, processors, non-EU transfers, user rights, GDPR contact process, export/correction/restriction/deletion/security incident handling; reviewed before launch.
  Status: planned.
  Blocks launch: yes.

- Name: Consent and cookie policy.
  Description: Plan cookie/storage policy, consent banner only if non-technical tools are added, consent evidence, preference changes and pre-consent blocking of analytics/marketing scripts.
  Reason: Technical auth/PWA storage should be separated from optional analytics/marketing.
  Priority: P0 – Launch blocker if non-technical tracking is used; otherwise P1.
  Phase: B.
  Dependencies: Cookies/storage audit and final analytics/marketing provider choice.
  Impacted parts: future consent module, public cookie page, analytics integration, settings/privacy UI.
  Risk: Invalid consent or overblocking necessary app functions.
  Acceptance: Technical storage is documented; optional tracking is disabled until valid consent; user can later change consent.
  Status: planned.
  Blocks launch: conditional.

- Name: Processor and DPA register.
  Description: Maintain central register of processors/subprocessors and DPA status for Vercel, Supabase, Google OAuth, payment gateway, email service, monitoring, analytics, push and backups.
  Reason: GDPR documentation and incident response require processor visibility.
  Priority: P0 – Launch blocker.
  Phase: B.
  Dependencies: Provider inventory.
  Impacted parts: docs, privacy policy, vendor contracts.
  Risk: Using processors without reviewed terms/DPA.
  Acceptance: Each production provider has documented purpose, data categories, DPA/terms URL, transfer basis if outside EEA, retention and incident contact.
  Status: planned.
  Blocks launch: yes.

### Phase C - Bezpečnosť A Používateľské Práva

- Name: Account deletion process.
  Description: Plan a separate account deletion flow with consequences, identity re-verification, severe-action confirmation, optional waiting period, cancellation window, subscription cancellation, data deletion/anonymization, Storage cleanup, backups handling, legally retained records and final confirmation.
  Reason: Deleting an account is different from canceling a subscription and must not break database integrity or other users' data.
  Priority: P0 – Launch blocker.
  Phase: C.
  Dependencies: Retention policy, subscription model, payment provider rules, auth/session management.
  Impacted parts: future settings/privacy UI, DB entities `account_deletion_requests`, storage cleanup jobs, auth admin integration, email templates.
  Risk: Accidental deletion, incomplete deletion, legal retention conflicts.
  Acceptance: User can request deletion securely; process records state; files are removed or anonymized; required accounting records are retained; completion email is sent.
  Status: planned.
  Blocks launch: yes.

- Name: User data export.
  Description: Plan authenticated export of profile, vehicles, fuel/charging, expenses, service records, reminders, document metadata, subscription history and preferences, with JSON, CSV and ZIP options where appropriate.
  Reason: Users need practical data portability and support for GDPR access/export requests.
  Priority: P0 – Launch blocker.
  Phase: C.
  Dependencies: Export request model, retention policy, Storage access rules.
  Impacted parts: future settings/privacy UI, server export jobs, Storage ZIP packaging, `data_export_requests`.
  Risk: Export leaking another user's data or exposing stale signed URLs.
  Acceptance: Export is available only to authenticated owner; includes expected categories; downloads expire; export request is logged.
  Status: planned.
  Blocks launch: yes.

- Name: Retention policy.
  Description: Define retention for active user data, post-cancellation data, post-account-deletion data, payment records, accounting documents, security logs, app logs, webhook events, exports, backups, failed registrations, unverified accounts, consents and legal acceptances.
  Reason: Data should not be kept forever by accident, and legal records must be kept where required.
  Priority: P0 – Launch blocker.
  Phase: C.
  Dependencies: Legal/accounting review and database model.
  Impacted parts: docs, future config, cleanup jobs, privacy policy, backup policy.
  Risk: Over-retention, premature deletion of legally required records, scattered hardcoded retention periods.
  Acceptance: Retention periods are documented and centrally configurable where possible; policy is reflected in privacy text and cleanup jobs.
  Status: planned.
  Blocks launch: yes.

- Name: Backup and recovery plan.
  Description: Plan database backups, document Storage backups, retention periods, encryption, restore tests, recovery runbook, responsibility owner, personal-data deletion from backups and protection against accidental bulk deletion.
  Reason: Paid users need recoverable service, not just enabled backups.
  Priority: P0 – Launch blocker.
  Phase: C.
  Dependencies: Supabase plan capabilities, Storage backup strategy, retention policy.
  Impacted parts: Supabase, Storage, operations docs, incident response.
  Risk: Data loss or inability to prove restore capability.
  Acceptance: Documented restore procedure exists and has been tested on non-production data; backup retention and encryption are verified.
  Status: planned.
  Blocks launch: yes.

- Name: Monitoring, logging and incident response.
  Description: Plan monitoring for app/server/database/webhook/email/security/performance/availability failures and an incident process covering identification, containment, data impact evaluation, internal documentation, user notification, ÚOOÚ assessment, fix and post-incident review.
  Reason: Paid production service needs operational visibility and privacy-safe incident handling.
  Priority: P0 – Launch blocker for incident response baseline; P1 for advanced monitoring.
  Phase: C.
  Dependencies: Provider choices for monitoring and email.
  Impacted parts: future monitoring provider, logs, admin dashboards, support process.
  Risk: Silent failures, sensitive data in logs, missed breach notifications.
  Acceptance: Logs are minimized and exclude passwords, tokens, payment data and document contents; alerting exists for critical failures; incident runbook is documented.
  Status: planned.
  Blocks launch: yes.

- Name: Authentication and account security roadmap.
  Description: Audit and plan email verification, secure email change, password change/reset if email auth is added, brute-force protection, rate limiting, active sessions, sign out from all devices, suspicious-login alerts, future MFA and account recovery.
  Reason: Account takeover would expose vehicle data, documents and billing state.
  Priority: P0 – Launch blocker for current Google-auth hardening; P2/P3 for optional MFA and extra auth methods.
  Phase: C.
  Dependencies: Auth method decisions, Supabase Auth configuration.
  Impacted parts: Supabase Auth settings, `src/app/auth`, settings account UI, email templates.
  Risk: Account takeover, stale sessions, insecure recovery.
  Acceptance: Current login method is reviewed; sensitive account actions require fresh auth or equivalent; session and recovery behavior is documented.
  Status: planned.
  Blocks launch: yes.

### Phase D - Predplatné A Platby

- Name: Payment gateway selection.
  Description: Choose a payment provider for CZK monthly consumer subscriptions and document supported trial, recurring billing, refunds, receipts/invoices, webhook signing, customer portal, DPA and Czech/EU suitability.
  Reason: Provider capabilities shape subscription model, checkout, cancellation and accounting.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Accounting/legal review and provider inventory.
  Impacted parts: future billing integration, provider inventory, privacy policy, checkout.
  Risk: Choosing a gateway that cannot support required consumer/legal/accounting flows.
  Acceptance: Selected gateway is documented with sandbox setup, DPA/terms, supported events, fee/accounting implications and fallback plan.
  Status: planned.
  Blocks launch: yes.

- Name: Payment gateway abstraction.
  Description: Plan a gateway abstraction so app logic is not tightly coupled to one provider.
  Reason: The provider is not selected yet and future migration should not rewrite subscription business logic.
  Priority: P1 – Nutné krátko po spustení.
  Phase: D.
  Dependencies: Subscription domain model.
  Impacted parts: future `src/lib/billing`, route handlers, webhook processors, tests.
  Risk: Lock-in and duplicated payment-state logic.
  Acceptance: Billing domain uses internal subscription/payment states and maps provider events through adapter functions.
  Status: planned.
  Blocks launch: no, if a well-isolated first provider integration is acceptable.

- Name: Subscription state model.
  Description: Plan states for no subscription, trialing, active, payment pending, payment failed, past due, canceled at period end, ended, paused and refunded.
  Reason: Access control and user billing UI need a precise state machine.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Payment provider event model, database model.
  Impacted parts: future `subscriptions`, access middleware/server checks, settings billing UI.
  Risk: Incorrect access after failed/canceled/refunded payment.
  Acceptance: State transition table exists and is covered by tests for trial, renewals, failed payments, cancellation, reactivation and refund.
  Status: planned.
  Blocks launch: yes.

- Name: Subscription database model design.
  Description: Design but do not yet create entities for `plans`, `subscriptions`, `subscription_events`, `payments`, `invoices` or `receipts`, `legal_documents`, `legal_acceptances`, `consent_records`, `data_export_requests`, `account_deletion_requests`, `webhook_events` and `audit_logs`.
  Reason: Paid operation requires auditability without schema changes being made prematurely.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Provider choice, legal acceptance requirements, retention policy.
  Impacted parts: future migrations, `src/types/database.ts`, billing data loaders.
  Risk: Data model that cannot handle price changes, trials, refunds or audit history.
  Acceptance: Design accounts for timezone, CZK, future currencies/prices, price changes without breaking existing subscriptions, trial, promos, refunds, history and auditability.
  Status: planned.
  Blocks launch: yes.

- Name: Order page / checkout pre-confirmation.
  Description: Plan clear order page before subscription activation showing product name, 30 Kč/month price, whether price is final, 14-day trial, first payment date, monthly auto-renewal, cancellation method, main service features and links to terms/privacy.
  Reason: Consumer must understand that confirming creates a payment obligation after trial/checkout rules.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Terms, privacy policy, payment provider, operator identity.
  Impacted parts: future checkout route, billing UI, legal acceptances.
  Risk: Invalid or unclear consumer order flow.
  Acceptance: Payment button text clearly indicates payment obligation, e.g. `Objednat a zaplatit 30 Kč`; ambiguous labels like `Pokračovat`, `Dokončit`, `Aktivovat účet` or `Registrovat se` are not used for paid confirmation.
  Status: planned.
  Blocks launch: yes.

- Name: Checkout consent and acceptance records.
  Description: Plan required checkboxes/records for accepting terms, acknowledging privacy policy and optionally explicit request to start service before withdrawal period ends; marketing consent must be optional.
  Reason: Legal acceptance must be evidenced and marketing consent must not gate service.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Legal document versioning and checkout page.
  Impacted parts: checkout UI, `legal_acceptances`, `consent_records`.
  Risk: Invalid consent, bundling marketing with service.
  Acceptance: Required legal acceptances are stored with document version/time/user/IP or relevant metadata; marketing consent is separate and optional.
  Status: planned.
  Blocks launch: yes.

- Name: User billing dashboard.
  Description: Plan account UI showing tariff, price, subscription status, start, trial end, next payment date, auto-renewal info, payment history, cancellation, payment-method update via gateway and downloadable documents if provider/system supports them.
  Reason: Users need transparent subscription self-service.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Subscription model, payment provider, email/document strategy.
  Impacted parts: future settings billing section, data loaders, provider portal links.
  Risk: Users cannot manage recurring charges.
  Acceptance: User can see current billing state and initiate cancellation/payment method update without support contact.
  Status: planned.
  Blocks launch: yes.

- Name: Subscription cancellation flow.
  Description: Plan direct in-app cancellation separate from account deletion, with explanation of stopped future payments, paid access end date, data handling and retention, in-app confirmation, email confirmation and reactivation before period end.
  Reason: Cancellation must be simple and transparent for monthly recurring service.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Payment provider customer/subscription APIs and email service.
  Impacted parts: billing UI, webhook processing, transactional emails.
  Risk: Dark pattern cancellation, disputes, unintended account deletion.
  Acceptance: User can cancel and reactivate; app and email confirmations are sent; access remains correct through period end.
  Status: planned.
  Blocks launch: yes.

- Name: Payment receipts and accounting documents.
  Description: Plan payment document generation/access containing operator, IČO, service label, payment date, price, billing period, currency, document number and VAT text based on confirmed tax status.
  Reason: Paid users may need receipts and operator must keep accounting evidence.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Accountant review, VAT status, payment provider capabilities.
  Impacted parts: billing UI, email templates, future `invoices`/`receipts` table.
  Risk: Incorrect tax document format or VAT handling.
  Acceptance: Accountant-approved document format and retention are documented before real payments.
  Status: planned.
  Blocks launch: yes.

- Name: Payment webhook processing.
  Description: Plan secure webhook handling with signature verification, idempotency, event id storage, duplicate protection, logging, retries, separate receive/process stages, periodic subscription reconciliation, out-of-order event handling, alerts and manual resync.
  Reason: Subscription state must never depend only on frontend-submitted data.
  Priority: P0 – Launch blocker.
  Phase: D.
  Dependencies: Payment gateway selection and database model.
  Impacted parts: future route handlers/API, `webhook_events`, worker/queue strategy, billing service.
  Risk: Duplicate charges, wrong subscription state, replay attacks.
  Acceptance: Webhook tests cover duplicate events, out-of-order events, DB failure during processing and manual reconciliation.
  Status: planned.
  Blocks launch: yes.

- Name: Transactional email system.
  Description: Plan templates for account creation, email verification, trial start, trial ending, paid activation, successful payment, failed payment, retry, cancellation, end of subscription, refund, terms/privacy changes, export request, deletion request, deletion completed and security alerts.
  Reason: Billing, legal changes and account security need reliable user communication.
  Priority: P0 – Launch blocker for billing/legal/security emails; P1 for less critical templates.
  Phase: D.
  Dependencies: Email provider selection, operator identity, legal documents, subscription flow.
  Impacted parts: future email provider integration, templates, support process.
  Risk: Users miss billing/cancellation/security/legal notices.
  Acceptance: Required templates exist in Czech, include correct operator identity, and are sent in test environment.
  Status: planned.
  Blocks launch: yes.

### Phase E - PWA Pripravenosť

- Name: PWA launch hardening.
  Description: Verify manifest, app name, short name, icons, maskable icons, theme/background colors, display mode, install behavior, responsive mobile/tablet/PC behavior, iOS Safari, Android Chrome and desktop browser behavior.
  Reason: Vehilo is sold as a PWA and must install and behave predictably.
  Priority: P0 – Launch blocker.
  Phase: E.
  Dependencies: Final icons/assets and production domain.
  Impacted parts: `public/manifest.json`, `src/app/layout.tsx`, PWA assets.
  Risk: Poor install experience or broken platform-specific behavior.
  Acceptance: PWA install and launch tested on iOS Safari, Android Chrome and desktop browsers.
  Status: planned.
  Blocks launch: yes.

- Name: Service worker update and offline safety.
  Description: Plan update notification, safe reload without losing entered data, offline fallback, offline behavior, cache strategy, no long-term caching of sensitive API responses, stale-version detection and recovery from corrupted local cache.
  Reason: PWA caching can break paid app data integrity if not deliberately managed.
  Priority: P0 – Launch blocker.
  Phase: E.
  Dependencies: Final service worker strategy and form persistence decisions.
  Impacted parts: `public/sw.js`, `ServiceWorkerProvider`, forms, data mutation flows.
  Risk: Serving stale app versions, caching sensitive data, data loss during updates.
  Acceptance: User data/API responses are not cached unnecessarily; app can recover from offline/cache issues; new version UX is tested.
  Status: planned.
  Blocks launch: yes.

- Name: Offline mutation and sync strategy.
  Description: Decide whether Vehilo will support offline edits; if yes, plan sync queue, duplicate-submit protection and conflict handling; if no, make offline write limitations explicit.
  Reason: Vehicle costs and reminders may be entered on mobile with unstable connection.
  Priority: P1 – Nutné krátko po spustení unless advertised as offline-write capable.
  Phase: E.
  Dependencies: Product decision on offline writes.
  Impacted parts: forms, server actions, service worker, future local queue.
  Risk: Duplicate records or lost edits.
  Acceptance: Offline behavior is documented and tested; duplicate submissions are prevented.
  Status: planned.
  Blocks launch: conditional.

- Name: Push notification system for reminders.
  Description: Plan contextual permission request, pre-permission explanation, consent storage/revocation, multiple devices, expiring subscriptions, token cleanup on logout, invalid token cleanup, notification type settings, quiet hours, timezone, deep links and non-sensitive lock-screen copy.
  Reason: Reminders are a core Vehilo feature and push must be privacy-safe.
  Priority: P1 – Nutné krátko po spustení; P0 if push is promised at launch.
  Phase: E.
  Dependencies: Push provider selection, reminder scheduler, privacy policy update.
  Impacted parts: reminders, settings notifications, service worker, provider inventory, privacy policy.
  Risk: Sending sensitive data to lock screen or retaining stale device tokens.
  Acceptance: Service reminders are separate from marketing notifications; user can disable notification types; provider is documented in privacy policy.
  Status: planned.
  Blocks launch: conditional.

### Phase F - Testovanie A Launch Readiness

- Name: Environment separation.
  Description: Plan development, test/staging and production environments with separate databases or data separation, payment keys, webhooks, env vars, URLs, analytics and email configuration.
  Reason: Production payments and user data must not be tested on live users.
  Priority: P0 – Launch blocker.
  Phase: F.
  Dependencies: Vercel/Supabase/payment/email provider setup.
  Impacted parts: Vercel projects/env, Supabase projects, payment sandbox/live config, email sandbox.
  Risk: Mixing test and production data/payments.
  Acceptance: Each environment has documented URLs, keys, webhooks and data boundaries; production payment testing uses an approved minimal-value process only after launch blockers are closed.
  Status: planned.
  Blocks launch: yes.

- Name: Subscription and legal E2E test plan.
  Description: Create unit, integration, E2E, security and manual legal/UX tests for full subscription lifecycle.
  Reason: Billing bugs are high-risk and hard to fix after real payments.
  Priority: P0 – Launch blocker.
  Phase: F.
  Dependencies: Checkout, webhook, subscription, cancellation, export and deletion flows.
  Impacted parts: test suite, payment sandbox, staging environment.
  Risk: Broken billing state, legal acceptance gaps, data rights failures.
  Acceptance: Tests cover new user without subscription, trial activation, first successful/failed payment, recurring success/failure, retry, cancel during trial, cancel active, reactivation, refund, duplicate webhook, out-of-order webhook, DB outage during webhook, email change, account deletion, export, expired subscription without data loss, resubscribe, offline PWA behavior, service worker update, multiple devices and push opt-out.
  Status: planned.
  Blocks launch: yes.

- Name: Availability and user-facing error states.
  Description: Plan clear handling of database outage, payment gateway outage, email outage, login outage, sync failure, upload failure, damaged file, duplicate payment, delayed webhook, expired session and no internet.
  Reason: Paid users need understandable recovery paths.
  Priority: P0 – Launch blocker for critical paid/login/data-write flows; P1 for status page polish.
  Phase: F.
  Dependencies: Monitoring, payment/email providers, PWA offline plan.
  Impacted parts: UI error states, support docs, status component/page.
  Risk: Users retry payments/uploads incorrectly or lose trust.
  Acceptance: Critical errors show localized Czech messages with next action; support/status path is documented.
  Status: planned.
  Blocks launch: yes.

- Name: Launch blocker checklist closure.
  Description: Complete the legal/accounting/security/technical checklist before enabling first real payments.
  Reason: Real recurring consumer payments should not start until non-negotiable obligations are closed.
  Priority: P0 – Launch blocker.
  Phase: F.
  Dependencies: All P0 tasks.
  Impacted parts: docs, legal pages, billing, auth, backups, monitoring, tests.
  Risk: Launching paid service without legal, tax or security readiness.
  Acceptance: Every item in the Launch Blocker Checklist below is checked and evidence is linked in the plan.
  Status: planned.
  Blocks launch: yes.

### Phase G - Úlohy Po Spustení

- Name: Secure administration and support tooling.
  Description: Plan admin tools for user lookup, subscription state, payment history without card data, resending transactional emails, manual payment sync, support notes, refund workflow via provider, legal document management, plans/prices and anonymized operational stats.
  Reason: Support will need safe operational tools after launch.
  Priority: P1 – Nutné krátko po spustení.
  Phase: G.
  Dependencies: Audit logs, role model, support process.
  Impacted parts: future admin routes, audit logs, payment provider, support docs.
  Risk: Overbroad admin access to personal documents or unaudited changes.
  Acceptance: Admin operations are role-protected and audited; personal documents are not accessible without legitimate reason and audit trail.
  Status: planned.
  Blocks launch: no, unless manual support is required for launch operations.

- Name: Growth roadmap.
  Description: Plan post-launch monitoring, customer support, product metrics, additional tariffs, family accounts, business/fleet accounts, additional currencies, expansion outside Czech Republic, OSS/international VAT analysis and multilingual legal documents.
  Reason: These are valuable but should not block the first Czech consumer launch.
  Priority: P3 – Budúce rozšírenie.
  Phase: G.
  Dependencies: Stable paid launch and legal/accounting review for new markets.
  Impacted parts: billing model, roles, organizations, translations, legal docs.
  Risk: Premature scope expansion before core subscription is stable.
  Acceptance: Growth items remain separate from launch blockers and are reprioritized after production usage data.
  Status: planned.
  Blocks launch: no.

### Launch Blocker Checklist Before Real Payments

All items below are `P0 – Launch blocker` and must be closed before activating first real recurring payments:

- [ ] Complete current architecture/auth/database/storage/PWA/external-service audit.
- [ ] Confirm active trade/business authorization and correct business activity with Czech professional advice.
- [ ] Confirm IČO and operator identity values.
- [ ] Confirm CSSZ notification obligations with Czech accountant or relevant authority.
- [ ] Confirm health insurance notification obligations with Czech accountant or relevant insurer.
- [ ] Confirm tax regime and whether the operator is a VAT payer or non-payer.
- [ ] Check identified-person-to-VAT risk, especially for foreign providers and cross-border services, with accountant.
- [ ] Check all foreign suppliers and DPA/transfer implications.
- [ ] Confirm receipt/invoice/accounting document format and retention with Czech accountant.
- [ ] Implement central configurable operator identity source.
- [ ] Publish Contact/Operator/Legal information pages.
- [ ] Publish lawyer-reviewed Czech terms of service.
- [ ] Publish lawyer-reviewed Czech privacy policy.
- [ ] Complete processor/subprocessor register and DPA review.
- [ ] Complete cookie/storage audit and implement consent handling if non-technical technologies are used.
- [ ] Implement legal document versioning and user acceptance records.
- [ ] Select payment gateway and verify sandbox/live capabilities.
- [ ] Design and implement subscription database model.
- [ ] Implement checkout with clear payment-obligation button and legal checkboxes.
- [ ] Implement billing dashboard with subscription status, next payment and cancellation.
- [ ] Implement direct cancellation, email confirmation and reactivation before period end.
- [ ] Implement webhook signature verification, idempotency, retry and reconciliation.
- [ ] Implement payment receipt/invoice access or provider document access.
- [ ] Implement required transactional billing/legal/security emails.
- [ ] Implement account deletion process.
- [ ] Implement user data export.
- [ ] Define and implement retention policy.
- [ ] Complete Supabase RLS, Storage, function and server-action authorization audit.
- [ ] Verify secrets are not in Git and service-role keys are never exposed to frontend.
- [ ] Separate development, staging/test and production environments.
- [ ] Complete backup and restore plan, including tested restore.
- [ ] Complete monitoring/logging baseline and incident response runbook.
- [ ] Complete PWA install/update/offline cache safety tests.
- [ ] Complete subscription lifecycle E2E tests in sandbox.
- [ ] Complete security audit for user data isolation and billing operations.
- [ ] Complete legal review of documents and checkout/withdrawal/complaints/auto-renewal flow.
- [ ] Complete accounting review of billing, VAT and payment documents.
- [ ] Run production payment test with approved minimal amount only after all previous blockers are closed.

### Recommended Implementation Order For Paid Launch

1. Close Phase A audit tasks and provider inventory.
2. Decide operator identity source and payment/email/monitoring provider shortlist.
3. Draft database model for legal, consent, subscription, payments, exports, deletion, webhooks and audit logs.
4. Complete legal/accounting review inputs before writing final legal texts.
5. Build public legal pages, legal versioning and acceptance records.
6. Build subscription state model, checkout and billing account UI.
7. Build webhook pipeline, payment reconciliation and transactional emails.
8. Build cancellation, export, deletion and retention processes.
9. Harden Supabase RLS/Storage/auth, PWA offline/update behavior and environment separation.
10. Run full sandbox E2E, security, legal UX and accounting launch checks.

### Likely Future Files And Modules

- `docs/VEHILO_PROJECT_PLAN.md`
- `README.md`
- `supabase/schema.sql` and future migrations
- `src/types/database.ts`
- future `src/lib/legal/*`
- future `src/lib/billing/*`
- future `src/lib/email/*`
- future `src/lib/audit/*`
- future `src/app/(legal)/*` or public legal routes
- future `src/app/(app)/settings/billing/*`
- future payment webhook route handlers
- future admin/support routes
- `src/lib/supabase/server.ts`
- `src/app/auth/*`
- `src/components/providers/service-worker-provider.tsx`
- `public/sw.js`
- `public/manifest.json`

### Open Decisions For Paid Launch

- Confirm legal operator: individual or company, exact public identity values and trade-register wording.
- Confirm VAT status and whether identified-person registration is triggered by providers or sales flows.
- Choose payment gateway.
- Choose transactional email provider.
- Decide whether analytics/error monitoring will be used at launch and under what consent basis.
- Decide whether push notifications are part of first paid launch or shortly after.
- Decide whether offline writes are supported at launch or explicitly out of scope.
- Decide staging architecture: separate Supabase project or strict data isolation.
- Decide how long data remains after subscription cancellation.
- Decide waiting period for account deletion.
- Decide whether document downloads are generated by Vehilo or delegated to payment provider.
- Decide support/admin role model and whether manual support can access user documents.

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

### 2026-07-12

- Confirmed Vercel GitHub repository connection is completed.
- Confirmed Vercel production URL is added to Google OAuth Authorized JavaScript origins.
- Confirmed Vercel `/auth/callback` URL is added to Supabase Auth redirect URLs.
- Approved the refreshed landing page design as the visual direction for the rest of the app.
- Confirmed the remaining plan still matches the intended direction.
- Imported `Import golf data/My_Car_Costs_20260712-101336.csv` into Supabase for Google user `marcel.mlynarcik@gmail.com`.
- Created vehicle `Golfík` as a diesel Volkswagen Golf with `420651` km and `CZK` currency.
- Imported 8 expense records, 166 diesel fuel cost records and 31 service records.
- Refined imported Golf metadata: Golf V 2.0 TDI 103 kW, manual, hatchback, plate `5AL0570`, purchased from AAA Auto Brno on 2016-04-25 with 189000 km for 150000 CZK.
- The duplicated CSV file `My_Car_Costs_20260712-101336 (1).csv` is byte-identical and was not imported separately.
- Fuel quantity was not present in the My Car CSV export even though the source app tracks liters, so imported fuel records currently store total cost with quantity `0` and a note preserving the original timestamp.
- Implemented real profile preference saving from Settings, including user currency, units, language and theme values.
- Set the current user's profile currency and units to CZK, kilometers, liters and Czech.
- Updated key dashboard, statistics, vehicle, expense, fuel and service summaries to use the profile currency instead of hardcoded EUR.
- Added PWA manifest, Android install metadata, iOS Apple web app metadata, Apple touch icon, iPhone/iPad startup images, service worker registration and an offline fallback page.
- Current next implementation point is validating the PWA setup, pushing the changes and then continuing the real vehicles CRUD slice.

### 2026-07-20

- Started Phase 6 Fuel & Energy Core with real creation of `energy_entries` through the Fuel & Energy screen.
- Added a powertrain-aware fuel/charging form for first real entries, including today's date default, mileage, quantity, total/unit price, full tank/full charge and station/location fields.
- Added ownership-checked server action validation before inserting energy records and updating the vehicle current mileage when the new record has a higher odometer value.
- Added a recent fuel/energy log table to the Fuel & Energy screen.
- Added edit/delete actions for energy records and improved consumption summaries so they are grouped by vehicle, entry type and unit between full records.
- Added permanent analytics verification rule: every calculation, chart, metric card and statistics view must be checked against real Supabase data before completion.
- Remaining Phase 6 work: refined electric/PHEV/LPG/CNG statistics and real charts.

### 2026-07-23

- Confirmed the previously listed mobile UX fixes are now implemented.
- Completed visual mobile verification; current mobile UX is acceptable.
- Confirmed Expense cost per km no longer reproduces as `0 Kč/km`; current Golfík Supabase data gives a non-zero expense cost per km.
- Confirmed Service filters and real Service charts are implemented.
- Verified Service chart source aggregates against real Supabase data: 31 service records, 105873 Kč total, 10 service types, yearly totals from 2021 through 2026.
- Updated next priority to continue Phase 6 Fuel & Energy statistics and real chart refinement.
- Added Fuel & Energy filters for vehicle, record type and year.
- Added Fuel & Energy cost charts by year, record type and vehicle, using real energy entry data.
- Verified current Fuel & Energy source aggregates against Supabase: 167 fuel records, 242119.02 Kč total, yearly totals from 2022 through 2026.
- Removed duplicate Quick Add action for charging; the single Fuel & Energy quick action now covers both fuel and charging.
- Fixed React lint issues in Energy and Service forms by moving derived state updates out of synchronous effects.

Reminder product requirements captured for future implementation:

- When a reminder becomes due, the app must show a reminders list where due/active reminders remain visually highlighted until the user marks them done or otherwise resolves them.
- Users must be able to postpone a reminder by a user-entered number of kilometers or days.
- When a reminder is marked done, the app must ask whether to create the same reminder again for the next interval.
- Reminders must support functional push notifications on Android and iPhone.
- Push notifications must be implemented as part of the reminders product flow, with device registration, opt-in/permission handling and reminder delivery behavior tested on both Android and iOS.
