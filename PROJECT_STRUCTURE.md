# RiseUp Admin - Project Structure

## Overview

Basketball League Administration Portal built with Next.js 14, TypeScript, MongoDB, and Stripe integration.

## Technology Stack

- **Frontend**: Next.js 14.2.18 (App Router), React 18, TypeScript 5
- **Styling**: Tailwind CSS 3.4.1, Radix UI, shadcn/ui (New York style)
- **Backend**: Next.js API Routes, MongoDB with Mongoose 7.6.10
- **Authentication**: NextAuth.js 4.24.7 with JWT
- **Payments**: Stripe SDK 19.1.0 (Terminal integration)
- **Forms**: React Hook Form 7.63.0 + Zod 3.25.76
- **Communication**: Twilio 5.10.2 (SMS)
- **Utilities**: date-fns, lodash, bcryptjs, xlsx, sonner

## Directory Structure

```
riseup-admin/
│
├── src/
│   │
│   ├── app/                                    # Next.js App Router (Pages & API)
│   │   │
│   │   ├── (admin)/                           # Admin Route Group (protected routes)
│   │   │   ├── dashboard/                     # Main dashboard
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── league/                        # League Management Module
│   │   │   │   ├── cities/                    # City CRUD
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── divisions/                 # Division CRUD
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   ├── levels/                    # League Level Settings
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── locations/                 # Venue/Location Management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   ├── players/                   # Player Management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   ├── teams/                     # Team Management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   └── prices/                    # Pricing Configuration
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── games/                         # Game Management
│   │   │   │   ├── page.tsx                   # Game list/schedule
│   │   │   │   └── [id]/                      # Individual game details
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── jerseys/                       # Jersey Design & Ordering
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │
│   │   │   ├── payments/                      # Payment Management
│   │   │   │   ├── page.tsx                   # Payment overview
│   │   │   │   └── [playerId]/                # Player-specific payments
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── photos/                        # Photo Management
│   │   │   │   ├── page.tsx                   # Photo dashboard
│   │   │   │   ├── [gameId]/                  # Game-specific photos
│   │   │   │   │   └── page.tsx
│   │   │   │   └── media-day/                 # Media Day photos
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── scorekeeper/                   # Live Game Scoring
│   │   │   │   └── [gameId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── settings/                      # Admin Settings
│   │   │   │   ├── admins/                    # Admin User Management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   └── terminal/                  # Stripe Terminal Config
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── test/                          # Testing/Debug Routes
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── layout.tsx                     # Admin layout wrapper
│   │   │
│   │   ├── api/                               # API Routes
│   │   │   │
│   │   │   ├── auth/                          # NextAuth Endpoints
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── v1/                            # API Version 1
│   │   │   │   ├── admins/                    # Admin CRUD API
│   │   │   │   │   ├── route.ts               # GET, POST
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts           # GET, PUT, DELETE
│   │   │   │   │
│   │   │   │   ├── cities/                    # City CRUD API
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── divisions/                 # Division CRUD API
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── games/                     # Game Operations API
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   │   ├── publish/
│   │   │   │   │   │   └── roster/
│   │   │   │   │   └── upcoming/
│   │   │   │   │
│   │   │   │   ├── jerseys/                   # Jersey Management API
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │
│   │   │   │   ├── league/                    # League Data Endpoints
│   │   │   │   │   ├── divisions/
│   │   │   │   │   ├── levels/
│   │   │   │   │   ├── locations/
│   │   │   │   │   └── teams/
│   │   │   │   │
│   │   │   │   ├── payments/                  # Payment Processing API
│   │   │   │   │   ├── methods/               # Payment methods
│   │   │   │   │   ├── installments/          # Installment tracking
│   │   │   │   │   ├── cash/                  # Cash payments
│   │   │   │   │   ├── debit/                 # Debit payments
│   │   │   │   │   └── terminal/              # Stripe Terminal
│   │   │   │   │
│   │   │   │   ├── photos/                    # Photo Upload/Management API
│   │   │   │   │   ├── game/
│   │   │   │   │   └── media-day/
│   │   │   │   │
│   │   │   │   ├── players/                   # Player CRUD API
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── scorekeeper/               # Game Scoring API
│   │   │   │   │   └── [gameId]/
│   │   │   │   │       ├── stats/
│   │   │   │   │       └── clock/
│   │   │   │   │
│   │   │   │   ├── teams/                     # Team CRUD API
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── terminal/                  # Stripe Terminal API
│   │   │   │   │   ├── readers/
│   │   │   │   │   └── payment-intent/
│   │   │   │   │
│   │   │   │   └── users/                     # User Search/Lookup
│   │   │   │       └── search/
│   │   │   │
│   │   │   └── webhooks/                      # External Webhooks
│   │   │       └── stripe-terminal/
│   │   │           └── route.ts
│   │   │
│   │   ├── login/                             # Login Page
│   │   │   └── page.tsx
│   │   │
│   │   ├── unauthorized/                      # 403 Forbidden Page
│   │   │   └── page.tsx
│   │   │
│   │   ├── fonts/                             # Custom Font Files
│   │   │
│   │   ├── layout.tsx                         # Root Layout (HTML wrapper)
│   │   ├── globals.css                        # Global Styles
│   │   └── favicon.ico
│   │
│   ├── components/                            # React Components
│   │   │
│   │   ├── ui/                                # Base UI Components (shadcn/ui)
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── common/                            # Shared Components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── DataTable.tsx
│   │   │
│   │   ├── layout/                            # Layout Components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── providers/                         # React Context Providers
│   │   │   ├── SessionProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   │
│   │   ├── features/                          # Feature-Specific Components
│   │   │   │
│   │   │   ├── admins/                        # Admin Management UI
│   │   │   │   ├── AdminList.tsx
│   │   │   │   ├── AdminForm.tsx
│   │   │   │   └── RoleSelector.tsx
│   │   │   │
│   │   │   ├── dashboard/                     # Dashboard Widgets
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   └── RecentActivity.tsx
│   │   │   │
│   │   │   ├── league/                        # League Components
│   │   │   │   ├── cities/
│   │   │   │   │   ├── CityList.tsx
│   │   │   │   │   └── CityForm.tsx
│   │   │   │   ├── divisions/
│   │   │   │   │   ├── DivisionList.tsx
│   │   │   │   │   └── DivisionForm.tsx
│   │   │   │   ├── levels/
│   │   │   │   ├── locations/
│   │   │   │   ├── players/
│   │   │   │   │   ├── PlayerList.tsx
│   │   │   │   │   └── PlayerForm.tsx
│   │   │   │   ├── prices/
│   │   │   │   └── teams/
│   │   │   │       ├── TeamList.tsx
│   │   │   │       └── TeamForm.tsx
│   │   │   │
│   │   │   ├── payments/                      # Payment UI Components
│   │   │   │   ├── PaymentMethodSelector.tsx
│   │   │   │   ├── InstallmentTracker.tsx
│   │   │   │   ├── CashPaymentForm.tsx
│   │   │   │   └── TerminalPayment.tsx
│   │   │   │
│   │   │   ├── photos/                        # Photo Management UI
│   │   │   │   ├── PhotoUploader.tsx
│   │   │   │   ├── PhotoGallery.tsx
│   │   │   │   └── PhotographerAssignment.tsx
│   │   │   │
│   │   │   ├── scorekeeper/                   # Game Scoring UI
│   │   │   │   ├── Scoreboard.tsx
│   │   │   │   ├── PlayerStats.tsx
│   │   │   │   ├── GameClock.tsx
│   │   │   │   └── StatEntry.tsx
│   │   │   │
│   │   │   ├── terminal/                      # Stripe Terminal UI
│   │   │   │   ├── ReaderList.tsx
│   │   │   │   └── TerminalConfig.tsx
│   │   │   │
│   │   │   └── test/                          # Debug Components
│   │   │
│   │   ├── games/                             # Game-Specific Components
│   │   │   ├── GameList.tsx
│   │   │   ├── GameCard.tsx
│   │   │   └── GameSchedule.tsx
│   │   │
│   │   ├── jerseys/                           # Jersey Components
│   │   │   ├── JerseyDesigner.tsx
│   │   │   └── JerseyOrder.tsx
│   │   │
│   │   └── score/                             # Scoring Display
│   │       └── ScoreDisplay.tsx
│   │
│   ├── lib/                                   # Utility Libraries
│   │   │
│   │   ├── api/                               # API Client Utilities
│   │   │   ├── admins.ts
│   │   │   ├── cities.ts
│   │   │   ├── divisions.ts
│   │   │   ├── games.ts
│   │   │   ├── jerseys.ts
│   │   │   ├── locations.ts
│   │   │   ├── payments.ts
│   │   │   ├── photos.ts
│   │   │   ├── players.ts
│   │   │   ├── scorekeeper.ts
│   │   │   ├── teams.ts
│   │   │   └── terminal.ts
│   │   │
│   │   ├── auth/                              # Authentication Logic
│   │   │   ├── auth.config.ts                 # NextAuth configuration
│   │   │   └── permissions.ts                 # Permission utilities
│   │   │
│   │   ├── db/                                # Database Layer
│   │   │   ├── mongodb.ts                     # MongoDB connection (cached)
│   │   │   └── queries/                       # Database Query Functions
│   │   │       ├── admins.ts
│   │   │       ├── games.ts
│   │   │       ├── players.ts
│   │   │       └── teams.ts
│   │   │
│   │   ├── services/                          # Business Logic Services
│   │   │   ├── stripe-customer-service.ts     # Stripe customer management
│   │   │   ├── stripe-terminal-service.ts     # Stripe Terminal operations
│   │   │   └── payment-service.ts             # Payment processing
│   │   │
│   │   ├── utils/                             # Utility Functions
│   │   │   ├── date.ts                        # Date formatting
│   │   │   ├── formatters.ts                  # Data formatters
│   │   │   └── validators.ts                  # Validation helpers
│   │   │
│   │   ├── validations/                       # Zod Validation Schemas
│   │   │   ├── admin.ts
│   │   │   ├── city.ts
│   │   │   ├── division.ts
│   │   │   ├── game.ts
│   │   │   ├── jersey.ts
│   │   │   ├── location.ts
│   │   │   ├── payment.ts
│   │   │   ├── player.ts
│   │   │   └── team.ts
│   │   │
│   │   └── utils.ts                           # Tailwind className utility (cn)
│   │
│   ├── models/                                # Mongoose Database Models
│   │   ├── Admin.ts                           # Admin user schema
│   │   ├── City.ts                            # City schema
│   │   ├── Division.ts                        # Division schema
│   │   ├── Game.ts                            # Game schema
│   │   ├── GamePhoto.ts                       # Game photo schema
│   │   ├── JerseyOrder.ts                     # Jersey order schema
│   │   ├── Level.ts                           # League level schema
│   │   ├── Location.ts                        # Venue/location schema
│   │   ├── MediaDayPhoto.ts                   # Media day photo schema
│   │   ├── PaymentMethod.ts                   # Payment method schema
│   │   ├── Player.ts                          # Player schema
│   │   ├── Price.ts                           # Pricing schema
│   │   ├── Team.ts                            # Team schema
│   │   ├── User.ts                            # User schema
│   │   ├── ChatChannel.ts                     # Chat channel schema
│   │   ├── ChatMessage.ts                     # Chat message schema
│   │   └── MessageForward.ts                  # Message forward schema
│   │
│   ├── types/                                 # TypeScript Type Definitions
│   │   ├── auth.ts                            # Auth-related types
│   │   ├── city.ts                            # City types
│   │   ├── division.ts                        # Division types
│   │   ├── game.ts                            # Game types
│   │   ├── jersey.ts                          # Jersey types
│   │   ├── level.ts                           # Level types
│   │   ├── location.ts                        # Location types
│   │   ├── payment.ts                         # Payment types
│   │   ├── player.ts                          # Player types
│   │   └── team.ts                            # Team types
│   │
│   ├── contexts/                              # React Context Providers
│   │   └── GameContext.tsx
│   │
│   ├── hooks/                                 # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useToast.ts
│   │
│   ├── constants/                             # Application Constants
│   │   ├── permissions.ts                     # Role-based permissions map
│   │   └── routes.ts                          # Route constants
│   │
│   └── middleware.ts                          # Next.js Middleware (Auth + RBAC)
│
├── scripts/                                   # Utility Scripts
│   ├── seed-admin.ts                          # Seed admin users
│   └── seed-city.ts                           # Seed city data
│
├── public/                                    # Static Assets
│   ├── images/
│   └── icons/
│
├── Configuration Files
├── .env.local                                 # Environment variables (not in git)
├── .env.example                               # Example environment variables
├── .gitignore                                 # Git ignore rules
├── package.json                               # Dependencies & scripts
├── package-lock.json                          # Dependency lock file
├── tsconfig.json                              # TypeScript configuration
├── next.config.js                             # Next.js configuration
├── tailwind.config.ts                         # Tailwind CSS design tokens
├── components.json                            # shadcn/ui configuration
├── postcss.config.mjs                         # PostCSS configuration
└── README.md                                  # Project documentation
```

## Key Architectural Patterns

### 1. Route Organization
- **Route Groups**: `(admin)` for protected admin routes without affecting URLs
- **Dynamic Routes**: `[id]`, `[gameId]`, `[playerId]` for resource-specific pages
- **Nested Layouts**: Layout components at different levels for shared UI

### 2. Authentication & Authorization
```
Flow: Request → Middleware → Auth Check → Permission Check → Route/API
- NextAuth.js handles session management
- Middleware (src/middleware.ts) protects all admin routes
- Role-based permissions defined in src/constants/permissions.ts
- Admin roles: EXECUTIVE, COMMISSIONER, SCOREKEEPER, PHOTOGRAPHER
```

### 3. Database Architecture
```
Connection: MongoDB (cached global connection)
ODM: Mongoose with TypeScript schemas
Pattern: Model registration at connection time
Queries: Abstracted in src/lib/db/queries/
```

### 4. API Design
```
Structure: RESTful API under /api/v1/
Versioning: Version prefix allows future API changes
Organization: Feature-based (admins/, games/, payments/, etc.)
Methods: Standard HTTP verbs (GET, POST, PUT, DELETE)
```

### 5. Component Architecture
```
ui/ → Base components (Radix UI + shadcn/ui)
common/ → Shared reusable components
features/ → Domain-specific business logic components
layout/ → Page structure components
```

### 6. Type Safety
```
Runtime: Zod schemas in src/lib/validations/
Compile-time: TypeScript types in src/types/
Database: Mongoose schema types in src/models/
Form validation: Zod + React Hook Form integration
```

### 7. State Management
```
Server State: React Query patterns in API calls
Client State: React Context (src/contexts/)
Form State: React Hook Form
Session State: NextAuth session
```

## Main Features

### League Management
- Cities, divisions, levels, locations
- Teams and players
- Pricing configuration
- Data import/export (Excel)

### Game Operations
- Game scheduling and roster management
- Live scoring with real-time stats
- Game publishing workflow
- Score display and history

### Payment Processing
- Multiple payment methods (Stripe, Cash, Terminal)
- Installment tracking
- Payment method management
- Stripe Terminal POS integration

### Photo Management
- Game photo upload and organization
- Media day photo management
- Photographer assignment
- Photo galleries

### Jersey System
- Jersey design templates
- Player jersey assignments
- Order management

### Admin Settings
- User management with RBAC
- Admin role assignment
- Stripe Terminal configuration
- System settings

## Development Commands

```bash
npm run dev              # Start development server (port 3001)
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run seed:admin       # Seed admin users
npm run seed:city        # Seed city data
```

## Environment Variables

See `.env.example` for required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Application URL
- `STRIPE_SECRET_KEY` - Stripe API key
- `TWILIO_*` - Twilio credentials

## Entry Points

1. **Application**: `src/app/layout.tsx` - Root HTML wrapper
2. **Admin Portal**: `src/app/(admin)/layout.tsx` - Admin section
3. **API**: `src/app/api/v1/` - REST endpoints
4. **Authentication**: `src/app/api/auth/[...nextauth]/route.ts` - Auth endpoints
5. **Middleware**: `src/middleware.ts` - Request interceptor (auth + RBAC)

## Security Features

- NextAuth.js session management with JWT
- Middleware-based route protection
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Environment variable protection
- Stripe webhook signature verification
- Admin account deactivation

## Code Organization Principles

1. **Separation of Concerns**: Each file has a single, clear responsibility
2. **Feature-Based**: Components and logic organized by domain feature
3. **Type Safety**: TypeScript strict mode + Zod runtime validation
4. **DRY**: Shared utilities extracted to lib/
5. **Scalability**: Modular architecture supports growth

## Path Aliases

TypeScript path alias configured in `tsconfig.json`:
```
@/* → src/*
```

Example:
```typescript
import { Button } from '@/components/ui/button'
import { connectToDatabase } from '@/lib/db/mongodb'
```

## Additional Resources

- Next.js Documentation: https://nextjs.org/docs
- NextAuth.js: https://next-auth.js.org
- shadcn/ui: https://ui.shadcn.com
- Stripe Terminal: https://stripe.com/docs/terminal
- MongoDB + Mongoose: https://mongoosejs.com
