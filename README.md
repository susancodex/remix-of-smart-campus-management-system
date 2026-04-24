# Smart Campus — Modern Campus Management

A production-ready, role-based platform for managing college activities: timetables, notices, notes, assignments, attendance, and users. Built with React, Vite, Tailwind CSS, shadcn/ui and a managed Postgres backend.

## Features

- 🎨 **Modern indigo SaaS UI** with light & dark mode
- 📅 **Timetable** — weekly schedule, admin CRUD
- 📢 **Notice board** — pinned/important highlights, search, pagination
- 📄 **Notes** — file uploads with signed-URL downloads
- 📝 **Assignments** — deadlines, submission tracking, overdue detection
- ✅ **Attendance** — subject-wise breakdown with progress bars
- 👥 **User management** — promote/demote with safety guards
- 🔐 **Role-based access** with row-level security
- 📱 **Fully responsive** + accessible

## Tech Stack

- React 18 + Vite 5 + TypeScript
- Tailwind CSS v3 + shadcn/ui + lucide-react
- React Router v6 + TanStack Query
- Managed Postgres backend with Auth & Storage

## Local development

```bash
npm install
npm run dev
```

## Deploying to Vercel

This project ships with a `vercel.json` configured for Vite + SPA routing.

1. Push the repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel will auto-detect the Vite framework. Confirm:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. The backend (Postgres + Auth) is managed by Lovable Cloud — environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) are already wired during the Lovable build. When deploying outside Lovable, copy them from your `.env` into Vercel **Project Settings → Environment Variables**.
5. Click **Deploy**. Done. SPA refresh deep links work out of the box thanks to the rewrites in `vercel.json`.

## First admin

The very first user to sign up automatically becomes Admin. Every subsequent user is a Student. Admins can promote/demote others from the **Users** page.
