# Momentum - Freelancer Productivity Tracker

## Overview

Momentum is a productivity tracking application designed specifically for freelancers to build consistency and transform effort into measurable growth. The app serves as a personal dashboard for freelancers' career momentum, helping them track work sessions, analyze productivity patterns, and monitor financial progress over time.

The application focuses on three core pillars: **Track** (effortless work session logging), **Analyze** (powerful insights and metrics), and **Motivate** (visual progress indicators and growth tracking). It provides a simple yet comprehensive solution for freelancers who want to move beyond "getting by" and build a stable, high-earning, and sustainable business.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing with pages for Dashboard, Timer, Journal, and Analytics
- **State Management**: TanStack React Query for server state management and caching, with custom hooks for business logic
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Session Management**: Express-session with in-memory storage for user authentication
- **API Design**: RESTful endpoints organized by feature (auth, sessions, earnings, analytics)
- **Data Layer**: Abstracted storage interface with in-memory implementation for development

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Schema**: Three main entities - Users (authentication), Work Sessions (time tracking), and Monthly Earnings (financial data)
- **Migrations**: Drizzle-kit for database schema management and version control

### Authentication System
- **Strategy**: Session-based authentication using HTTP cookies
- **Security**: Secure session cookies with httpOnly and proper expiration handling
- **User Management**: Registration, login, logout with password-based authentication

### Data Models
- **Users**: Basic profile information (name, email, username) with authentication credentials
- **Work Sessions**: Time tracking with task names, start/end times, duration calculation, and active session management
- **Monthly Earnings**: Financial tracking by month/year for income analysis and growth metrics

### API Structure
- **Auth Routes**: `/api/auth/*` for registration, login, logout, and session validation
- **Session Routes**: `/api/sessions/*` for work session CRUD operations and timer management
- **Earnings Routes**: `/api/earnings/*` for monthly earnings tracking and financial data
- **Analytics Routes**: `/api/analytics/*` for computed metrics and dashboard insights

### Development Tooling
- **TypeScript**: Full type safety across frontend, backend, and shared schema definitions
- **Path Aliases**: Organized imports with `@/` for client components and `@shared/` for common code
- **Code Quality**: ESLint and TypeScript compiler for code validation and consistency

## External Dependencies

### UI and Styling
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for rapid styling and responsive design
- **Recharts**: Data visualization library for earnings and work hours charts
- **Lucide React**: Icon library for consistent visual elements

### State Management and Data Fetching
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Form handling with validation and performance optimization
- **Zod**: Runtime type validation and schema parsing for API requests

### Database and ORM
- **Drizzle ORM**: Type-safe SQL query builder with PostgreSQL support
- **Drizzle-Zod**: Schema validation integration between database and runtime validation
- **Neon Database**: PostgreSQL hosting service (configured but not currently connected)

### Development and Build Tools
- **Vite**: Fast development server and build tool with React plugin support
- **Replit Plugins**: Development environment integration for runtime error handling and debugging
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

### Utilities and Helpers
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe CSS class composition for component variants
- **CLSX**: Conditional CSS class name composition utility