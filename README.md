# SHIFTIX CRM — Cloudflare Pages + D1

Built with React + Vite + Cloudflare Functions + Cloudflare D1

## Setup
### 1. Database Setup (Cloudflare D1)
Go to Cloudflare Dashboard → D1 → your `shiftix-db` database → Console tab
Run the contents of `schema.sql` to create tables and seed users.

### 2. Deploy to Cloudflare Pages
Build command: `npm run build`
Build output directory: `dist`

### 3. Environment Variables (in Cloudflare Pages settings)
```
RESEND_API_KEY=re_xxxx
EMAIL_FROM=SHIFTIX CRM <info@shiftix.in>
```

### 4. D1 Binding
In Cloudflare Pages → Settings → Functions → D1 database bindings:
- Variable name: `DB`
- D1 database: `shiftix-db`

## Users
All users login with password: `Shiftix@2026`

| Name | Email | Role |
|------|-------|------|
| Neha Singh | neha.singh@shiftix.in | Sales |
| Ritwik Kundu | ritwik.kundu@shiftix.in | Manager |
| Harshshikha Nandan | harshshikha.nandan@shiftix.in | Sales |
| Siddhant Prajapati | siddhant.prajapati@shiftix.in | Sales |
