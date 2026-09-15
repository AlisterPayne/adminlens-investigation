# CHANGELOG.md

## [7.0.0] - 2026-07-05

### Data tables

- Add `@tanstack/react-table` (^8.21.3) as the engine for all data tables (Customers, Orders, Invoices, Transactions)
- Introduce a reusable headless `DataTable` component with column-based rendering that preserves the existing markup and design
- Add functional column sorting (with currency/number/date-aware sort functions), pagination, row selection, and bulk delete
- Left-align all sortable column headers/labels
- Make the filter dropdowns, status tabs, and date-range selects functional (faceted column filtering + dataset-relative date windows)
- Apply column filters instantly on checkbox toggle (no Apply button needed)
- Add a `createdAt` field and "Created on" column to Customers so the date-range select filters them
- Wire the Invoices and Transactions search fields to real global filtering
- Preserve the Orders expandable rows and Transactions slide-over panel on top of TanStack row expansion/selection
- Remove the now-unused hand-rolled selection context and per-row table item components

### Detail & create pages

- Add "Add Customer", "Add Order", and "Create Invoice" pages wired to their toolbar buttons, each with a distinct layout: a profile card (avatar upload, VIP toggle) for customers, an interactive order builder with editable line items and live totals for orders, and an invoice-document + delivery-options view for invoices
- Add detail pages for Customers, Orders, Invoices, and Transactions, with primary cells linking to them
- Add a reusable row `⋯` actions menu (View detail / Edit / Remove) to Customers, Orders, and Transactions; add a "view detail" icon to the Invoices actions column
- Add "Customer Detail", "Order Detail", "Invoice Detail", and "Transaction Detail" links plus the "Add Customer", "Add Order", and "Create Invoice" pages to the sidebar navigation

### New dashboards

- Add 7 new dashboard variants, each at `/dashboard/<name>` with 8–11 cards on the standard 12-column grid:
  - **SaaS** (`/dashboard/saas`) — MRR, Annual Run Rate, Active Subscriptions, New vs Churned, Churn Rate, Plan Distribution, Revenue by Plan, ARPU/LTV, MRR Movement, Recent Signups
  - **Ecommerce** (`/dashboard/ecommerce`) — Total Revenue, Total Orders, Average Order Value, Revenue vs Refunds, Sales Over Time, Sales by Category, Conversion Funnel, Traffic Sources, Top Products, Recent Orders
  - **Marketing** (`/dashboard/marketing`) — Ad Spend, Conversions, ROAS, Spend vs Conversions by Channel, CPA Trend, Channel Mix, Email Open & Click Rates, Campaign Performance, Audience by Device, Top Campaigns
  - **Projects** (`/dashboard/projects`) — Active Projects, Tasks Completed, Team Utilization, Tasks by Status, Sprint Burndown, Tasks by Priority, Hours Logged, Active Tasks
  - **CRM** (`/dashboard/crm`) — Total Revenue, Deals Won, Win Rate, Pipeline by Stage, Forecast vs Quota, Deals by Source, Sales Rep Leaderboard, Revenue by Month, Lead Conversion Funnel, Recent Deals
  - **Support** (`/dashboard/support`) — Open Tickets, Resolved Today, Avg Response Time, Created vs Resolved, Ticket Volume, Tickets by Category, CSAT by Channel, Resolution Time Trend, Satisfaction by Priority, Recent Tickets, Agent Activity
  - **Monitoring** (`/dashboard/monitoring`) — Uptime, Requests / min, Error Rate, CPU Usage, Memory Usage, Requests by Status Code, Response Latency, Traffic by Region, Bandwidth Usage
- Wire all 7 dashboards into the sidebar under the **Dashboard** group
- Reuse the existing chart components (`line-chart-*`, `bar-chart-*`, `doughnut-chart`, `polar-chart`, `realtime-chart`) and card patterns; no new chart primitives added
- Fix chart cards that used `LineChart01`/`BarChart02` (both render a bare `<canvas>`) by wrapping them in a height-bounded `<div className="grow">`, preventing the canvas from growing unbounded (full-height/page lag)
- Ensure every time-scale line/bar chart is fed `MM-DD-YYYY` date labels (the x-axis parser expects dates, not categorical strings)

### Data modules & Community

- Move all sample/dummy data modules from `lib/` to a dedicated `data/` folder (customers, orders, invoices, transactions) with `getById` helpers used by both list and detail pages, and update imports
- Add a shared `data/users-data.ts` module (with `email`, `role`, and `status` fields) and refactor the Users - Tabs and Users - Tiles pages to consume it instead of inline data
- Add a new **Users - List** view (`/community/users-list`) — a Mosaic-style members table with avatar, email, role, location, and status
- Link every user (avatar + name on the Users - List, Tabs, and Tiles pages) to the Community Profile page (`/community/profile`)
- Add an **Add Member** page (`/community/add-user`) with avatar upload, role/status selects, bio, and invite toggle; wired from the "Add Member" button on the Users - Tabs, Users - Tiles, and Users - List pages
- Add "Users - List" and "Add Member" links to the Community sidebar navigation

### Branding

- Add the "Mosaic" wordmark next to the sidebar logo (hidden when the sidebar is collapsed to icons, shown when expanded and at 2xl)
- Add a left-aligned "Dashboard Template by Cruip.com" byline in the header, linking to `https://cruip.com` (visible on `lg` and up)

### Meta

- Set the homepage `<title>` to "Mosaic - Next.js Dashboard Template by Cruip.com"

### Fixes

- Correct the Changelog page metadata title (was "Roadmap - Mosaic" → now "Changelog - Mosaic")
- Fix the Onboarding step 4 "Go To Dashboard" link (`/dashboards` → `/dashboard`)

## [6.3.0] - 2026-07-02

- Upgrade to Next.js 16.2.10 and React 19.2.7
- Update to Tailwind 4.3.2
- Clean up dependencies and move types to devDependencies
- Remove unused default API route
- Add ESLint and Prettier configuration with import sorting
- Add favicon pack and web manifest
- Update root metadata
- Standardize README

## [6.2.0] - 2025-12-12

- Upgrade to Next.js 16.0.10 and React 19.2.3

## [6.1.0] - 2025-12-06

- Upgrade to Next.js 16.0.7

## [6.0.1] - 2025-04-21

- Minor calendar fix

## [6.0.0] - 2025-02-01

- Upgrade to Tailwind 4
- Update dependencies

## [5.3.0] - 2024-12-08

- Update dependencies + Upgrade to Next.js 15

## [5.2.0] - 2023-12-07

- Update Next.js to 14

## [5.1.1] - 2023-10-04

- Update dependencies

## [5.1.0] - 2023-06-20

- Fix issue with Google Fonts

## [5.0.0] - 2023-05-31

First Next.js release