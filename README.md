# cealDB - Library Database Management System

A comprehensive library database management system built with Next.js, Prisma, and PostgreSQL. This application provides forms and interfaces for managing various aspects of library collections including monographic acquisitions, serials, electronic resources, and more.

## 🧭 Overview (for librarians and administrators)

cealDB is an online system for collecting your library’s annual CEAL statistics. It guides you through ten structured forms, saves your progress safely, and clearly shows where you are in the process.

- What you can do
  - Fill out 10 survey forms (Monographic, Physical Volume Holdings, Serials, Other Holdings, Unprocessed Backlog, Fiscal Support, Personnel Support, Public Services, Electronic, Electronic Books).
  - Save Draft at any time and come back later.
  - Submit when a form is complete. Submitting locks in a “Submitted” status for the year.

- How statuses work on “My Forms”
  - Ready: You have not entered data yet for the current year.
  - Filled: You have saved data (a draft or an update exists).
  - Submitted: You clicked Submit for that form, and the system recorded it as complete for this year.

- Survey period and access
  - Your institution’s survey window (open/close dates) is shown on the admin pages.
  - If forms are closed, you’ll see “Form closed” and can no longer edit.

- What happens to your data
  - Drafts are only visible to your institution’s users.
  - Submitted data is used for the official annual statistics publication.

## 🚀 Features

- **Monographic Acquisitions Management** - Track purchased and non-purchased titles and volumes by language
- **Serials Management** - Manage serial publications and subscriptions
- **Electronic Resources** - Handle e-books, e-journals, and other digital collections
- **Personnel & Fiscal Support** - Track library staffing and budget information
- **Multi-language Support** - Specialized handling for Chinese, Japanese, Korean, and Non-CJK materials
- **Responsive UI** - Built with Tailwind CSS and shadcn/ui components
- **Type-safe Database** - Prisma ORM with TypeScript for robust data handling

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Authentication**: Built-in admin authentication system
- **Deployment**: Vercel-ready with PostgreSQL

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm package manager

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cealDB
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cealdb"

# Add other environment variables as needed
```

### 4. Database Setup

```bash
# Generate Prisma client, push schema, and seed database
npm run prisma

# Or run individually:
npx prisma generate --schema=./prisma/schema
npx prisma db push --force-reset --schema=./prisma/schema
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
cealDB/
├── app/                          # Next.js App Router
│   ├── (authentication)/         # Protected admin routes
│   │   └── admin/
│   │       └── forms/            # Form management pages
│   └── api/                      # API routes
│       ├── monographic/          # Monographic acquisitions API
│       └── [other-apis]/         # Other API endpoints
├── components/                   # Reusable UI components
│   ├── forms/                    # Form components
│   │   └── monographic-form.tsx  # Monographic acquisitions form
│   └── ui/                       # shadcn/ui components
├── prisma/                       # Database schema and migrations
│   └── schema/                   # Modular Prisma schemas
│       ├── monographic.prisma    # Monographic acquisitions schema
│       ├── serials.prisma        # Serials schema
│       ├── electronic.prisma     # Electronic resources schema
│       └── [other-schemas]/      # Additional schemas
├── lib/                          # Utility functions
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

## 🗄️ Database Schema

The application uses a modular Prisma schema approach with separate files for different domains:

- **Monographic Acquisitions** (`monographic.prisma`) - Books and monographic materials
- **Serials** (`serials.prisma`) - Periodicals and continuing resources
- **Electronic Resources** (`electronic.prisma`) - Digital collections
- **Personnel Support** (`personnel_support.prisma`) - Staffing information
- **Fiscal Support** (`fiscal_support.prisma`) - Budget and financial data
- **Library Management** (`library.prisma`) - Library and year information

## 📝 Forms and Data Entry

### Monographic Acquisitions Form

The monographic acquisitions form allows tracking of:

- **Purchased Titles & Volumes** by language (Chinese, Japanese, Korean, Non-CJK)
- **Non-Purchased Titles & Volumes** by language
- **Automatic Calculations** for subtotals and totals
- **Notes** for additional information
- **Integration** with library year data

**API Endpoint**: `POST /api/monographic/create`

**Form Location**: `/admin/forms/[libid]/monographic`

### Form Validation

All forms use Zod schema validation with:
- Type-safe field definitions
- Minimum value constraints
- Required field validation
- Custom error messages

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Database
npm run prisma       # Generate client, push schema, and seed

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## 🗺️ Roadmap

- Submitted receipts: confirmation messages and optional email notifications after submission
- Export tools: export your submitted data to CSV/PDF for local records
- Progress tracker: visual indicators of overall completion across all forms
- Accessibility and usability: continuous improvements for keyboard and screen-reader support
- Admin dashboards: enhanced overviews for survey coordinators (open/close status, participation highlights)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔐 Authentication

The application includes an admin authentication system protecting form routes under `/admin`. Configure authentication settings in your environment variables.

## 📊 Data Management

- **Prisma Studio**: Run `npx prisma studio` to view and edit data
- **Database Migrations**: Use `npx prisma migrate` for schema changes
- **Seeding**: Custom seed scripts populate initial data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](../../issues) page
2. Review the [Documentation](../../wiki)
3. Contact the development team

## 🔄 Recent Updates

- ✅ **Monographic Form Integration** - Complete form with API integration
- ✅ **Prisma Schema Alignment** - All field names match database schema
- ✅ **Type Safety** - Full TypeScript support with Zod validation
- ✅ **Modern UI** - Updated with shadcn/ui components

---

**Built with ❤️ for library management**
