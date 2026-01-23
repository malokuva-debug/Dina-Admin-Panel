# Admin Panel - Business Management System

A modern, mobile-first admin panel for managing business appointments, finances, and services.

## Features

- 📅 **Appointment Management** - Track and manage appointments for multiple workers
- 💰 **Finance Tracking** - Monitor revenue, expenses, and generate reports
- ⚙️ **Settings Management** - Configure services, business hours, and availability
- 📱 **Mobile-First Design** - Optimized for mobile devices with PWA support
- 📊 **PDF Reports** - Export financial reports for different time periods
- 🔔 **Notifications** - Browser notifications for appointment reminders (optional)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Storage**: LocalStorage (client-side)
- **PDF Generation**: jsPDF
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/malokuva-debug/Dina-Admin-Panel/
cd admin-panel
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
admin-panel/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components (Navbar, WorkerNav)
│   ├── finance/          # Finance-related components
│   ├── appointments/     # Appointment management
│   ├── settings/         # Settings components
│   └── modals/           # Modal components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── storage.ts       # LocalStorage helper
│   ├── config.ts        # App configuration
│   └── auth.ts          # Authentication (if needed)
├── types/               # TypeScript type definitions
├── public/              # Static assets
└── README.md
```

## Usage

### Worker Selection
Switch between workers (Dina/Kida) using the toggle buttons at the top.

### Finance Section
- View today's revenue, monthly profit, and total revenue
- Add and manage expenses
- Export financial reports as PDF

### Appointments Section
- View all appointments for the selected month
- Filter by worker
- Delete appointments

### Settings Section
- **Services**: Create categories and services with pricing
- **Business Hours**: Set opening hours and lunch breaks
- **Weekly Days Off**: Mark recurring closed days
- **Unavailable Dates**: Block specific dates
- **Unavailable Times**: Block specific time slots

## Building for Production

```bash
npm run build
npm start
```

## PWA Support (Optional)

To enable Progressive Web App features:

1. Install next-pwa:
```bash
npm install next-pwa
```

2. Uncomment the PWA configuration in `next.config.js`

3. Add icons to the `public/` folder:
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `apple-touch-icon.png` (180x180)
   - `favicon.ico` (32x32)

## Data Storage

Currently uses browser LocalStorage for data persistence. Data is stored locally on the device and not synced across devices.

### Storage Keys:
- `services` - Service definitions
- `categories` - Service categories
- `appointments` - Appointment data
- `expenses` - Expense records
- `businessHours` - Operating hours
- `weeklyDaysOff` - Recurring closed days
- `unavailableDates` - Blocked dates
- `unavailableTimes` - Blocked time slots

## Future Enhancements

- [ ] Backend API integration
- [ ] Multi-device sync
- [ ] Customer management
- [ ] SMS/Email notifications
- [ ] Calendar integration
- [ ] Advanced reporting and analytics
- [ ] User authentication
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email [your-email] or open an issue in the repository.
