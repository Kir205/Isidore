# Isidore Animal Clinic — Inventory & Payment System

A full-stack **Veterinary Clinic Management System** built with **Laravel 11**, **React 18 (Inertia.js)**, **Tailwind CSS**, and **SQLite**.

## Features

- **Dashboard** — Real-time clinic stats, revenue charts, low stock alerts
- **Inventory Catalog** — Full CRUD for medicines, vaccines, supplies & clinical services with live instant search
- **Payment / Invoicing** — Create invoices with automatic inventory deduction, receipt generation
- **Customer & Pet Management** — Client directory with editable visit history timelines
- **Stock Movements** — Automatic audit trail of all inventory changes

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend | React 18 + Inertia.js |
| Styling | Tailwind CSS v4 |
| Database | SQLite |
| Build | Vite |

## Local Development

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create database and seed with sample data
php artisan migrate --seed

# Start dev servers
php artisan serve &
npm run dev
```

Visit **http://127.0.0.1:8000**

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
3. Select this repository
4. Railway will auto-detect the Dockerfile and deploy
5. Your app will be live with a public URL!

## Running Tests

```bash
php artisan test
```
