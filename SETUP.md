# TravelCRM Setup Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 14+

## 1. Configure Environment

Edit `.env` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/travel_crm"
AUTH_SECRET="generate-a-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret: `openssl rand -base64 32`

## 2. Create the Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE travel_crm;"

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

## 3. Start the App

```bash
npm run dev
```

Visit: http://localhost:3000

## Demo Credentials

| Role  | Email                    | Password    |
|-------|--------------------------|-------------|
| Admin | admin@travelcrm.com      | admin1234   |
| Agent | sarah@travelcrm.com      | agent1234   |

## Modules

| Module       | Path           | Description                          |
|-------------|----------------|--------------------------------------|
| Dashboard   | /              | KPI cards, charts, recent activity   |
| Leads       | /leads         | Lead pipeline management             |
| Clients     | /clients       | Customer database                    |
| Bookings    | /bookings      | Tour booking management              |
| Tours       | /tours         | Tour package catalog                 |
| Destinations| /destinations  | Destination management               |
| Suppliers   | /suppliers     | Hotels, airlines, transport vendors  |
| Agents      | /agents        | Team management (Admin only)         |
| Invoices    | /invoices      | Invoice generation & tracking        |
| Payments    | /payments      | Payment recording & history          |
| Settings    | /settings      | Account & system info                |
