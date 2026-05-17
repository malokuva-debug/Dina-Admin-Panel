# 💅 Dina Admin Panel

A **full-featured admin dashboard** built with **Next.js App Router**, designed for beauty salons and service-based businesses.

It includes **appointment management, client CRM, finance tracking, worker dashboards, push notifications, and automated reminders**.

---

## 🚀 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- Web Push Notifications
- Cron-based automation
- PWA-ready (Service Workers + Manifest)

---

## 📂 Project Structure

```text
Dina-Admin-Panel/
├── app/
│   ├── admin-dashboard/
│   │   ├── clients/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── appointments/route.ts
│   │   ├── cron/appointment-reminders/route.ts
│   │   └── push/
│   │       ├── notify/route.ts
│   │       ├── send/route.ts
│   │       ├── subscribe/route.ts
│   │       └── route.ts
│   ├── clients/page.tsx
│   ├── worker-dashboard/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── globals.css
│   └── kida/page.tsx
│
├── components/
│   ├── admin/
│   ├── appointments/
│   ├── finance/
│   ├── settings/
│   ├── modals/
│   ├── layout/
│   └── shared UI components
│
├── hooks/
│   ├── useAppointments.ts
│   ├── useFinance.ts
│   ├── useNotifications.ts
│   └── useSettings.ts
│
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── AuthContext.tsx
│   ├── storage.ts
│   ├── notifications.ts
│   ├── cronJobOrg.ts
│   └── config.ts
│
├── scripts/
│   ├── appointment-reminders.ts
│   ├── realtime-appointments.ts
│   ├── generate-vapid.js
│   └── reset-password.mjs
│
├── public/
│   ├── icon.png
│   ├── manifest.json
│   ├── service-worker.js
│   ├── sw.js
│   └── robots.txt
│
├── types/
│   ├── index.ts
│   ├── user.ts
│   ├── global.d.ts
│   └── magicbell-js.d.ts
│
├── schema.sql
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## ✨ Core Features

### 🗓 Appointment Management
- Create, update, and cancel appointments
- Worker-based scheduling
- Realtime updates
- Automated reminders via cron jobs

### 👥 Client Management (CRM)
- Client profiles
- Service history & notes
- Admin client overview

### 💰 Finance & Reporting
- Revenue tracking
- Expense management
- Revenue per worker
- Exportable reports

### 📲 Push Notifications
- Web Push subscriptions
- Admin-triggered notifications
- Appointment reminders
- PWA support

### 👷 Worker Dashboard
- Dedicated worker interface
- Assigned appointments
- Worker-specific finance overview

### ⚙️ Business Settings
- Services & pricing
- Business hours
- Weekly days off
- Blocked dates & times

---

## 🔐 Authentication
- Supabase Auth
- Role-based access (Admin / Worker)
- Context-based authentication handling

---

## 🛠 Development

```bash
npm install
npm run dev
```

---

## 🌍 Deployment
- Optimized for Vercel
- Includes `vercel.json`
- PWA-ready for mobile installation

---

## 📌 Status
Actively developed and structured for scalability:
- Multi-location support
- Advanced analytics
- Extended notification channels
