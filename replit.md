# Hotel Audit Platform

## Overview

This is a comprehensive hotel brand audit automation platform that leverages AI technology to analyze diverse inputs such as photos, videos, and text-based checklists. The system supports multiple stakeholder personas including Admin (Vendor), Guest Auditor, Final Reviewer (QA), QA Corporate Team, and Hotel GM/Franchise Owner. The platform aims to automate hotel brand audits with 85%+ accuracy, handle up to 500 audits per day, and provide rapid actionable insights through detailed reporting.

## Recent Changes (January 29, 2025)

✓ **MAJOR: UI Improvements for Submit and Approve Button Logic**
✓ Auditor Dashboard: Removed submit button for properties in 'completed', 'submitted', 'approved' states
✓ Added read-only status messages for completed audits with appropriate visual indicators
✓ Reviewer Dashboard: Removed approve button for properties already in 'approved' state
✓ Added read-only message for approved audits preventing duplicate approvals
✓ Enhanced user experience by preventing invalid actions on finalized audits
✓ Fixed TypeScript error handling in auditor submission error messages

✓ **PROJECT MIGRATION COMPLETED: Successfully migrated hotel audit platform from Replit Agent to Replit environment**
✓ PostgreSQL database configured with proper environment variables and seeded with demo data
✓ All dependencies installed and application running cleanly on port 5000
✓ Security measures implemented with proper client/server separation
✓ All 5 role-based dashboards fully functional and operational
✓ Database schema pushed and populated with comprehensive seed data

✓ **MAJOR: Enhanced Corporate Dashboard with Real-Time KPI Analytics**
✓ Fixed Corporate dashboard individual tiles to show actual real-time values instead of dummy data
✓ Added comprehensive KPI calculations from audit data with intelligent fallbacks
✓ Enhanced KPI tiles with detailed real-time context descriptions  
✓ Added second row of performance metrics showing excellence distribution
✓ Implemented dynamic text updates based on actual audit completion status
✓ Real-time metrics now include: compliance rates, critical issues, pending audits, performance categories

✓ **MAJOR: Created 5 Comprehensive Survey Results with Varied Performance Levels**
✓ Added 5 new hotel properties across different regions and hotel groups
✓ Survey 1: Marriott Executive Apartments, Bangalore - Excellent Performance (92%)
✓ Survey 2: Hyatt Regency, Chennai - Poor Performance requiring immediate action (65%)
✓ Survey 3: ITC Grand Central, Mumbai - Good Performance with minor improvements (88%)
✓ Survey 4: Hilton Garden Inn, Gurgaon - Marginal Performance needing attention (76%)
✓ Survey 5: Taj Bengal, Kolkata - Outstanding Performance exceeding standards (94%)
✓ Each survey includes detailed findings, action plans, and individual audit item analysis
✓ Realistic performance distribution showing different compliance zones (green/amber/red)
✓ Enhanced database with comprehensive audit data for testing and demonstration

## Previous Changes

✓ **MAJOR: Enhanced Corporate Dashboard with Regional Performance Analytics**
✓ Comprehensive regional performance table with real audit data
✓ Export functionality for CSV reports with filtering by region
✓ Detailed property performance view with modal dialogs showing scores, findings, and action plans
✓ Regional summary cards with compliance rates and trend indicators
✓ Advanced filtering and sorting capabilities for performance analysis

✓ **MAJOR: Real-time Score Calculation System Implemented**
✓ Overall scores now calculate dynamically from individual audit item scores (0-5 scale → 0-100 scale)
✓ Category-specific scoring: Cleanliness (40% weight), Branding (30% weight), Operations (30% weight)  
✓ Real-time updates when reviewers override individual item scores
✓ Visual indicators showing "calculated from X analyzed items" status
✓ Fallback to static scores only when no individual items have been analyzed

✓ **PROJECT MIGRATION COMPLETED: Successfully migrated hotel audit platform from Replit Agent to standard Replit environment**
✓ **Enhanced AI Analysis**: Improved AI analysis workflow with better error handling and fallback scoring
✓ **Database Migration**: PostgreSQL database configured with proper environment variables and seeded with demo data
✓ **AI Integration**: Gemini API key configured for intelligent audit analysis with rate limiting protection
✓ **Application Ready**: Server running on port 5000 with all dashboards fully functional

✓ **MAJOR: Enhanced Visual Media Analysis with AI**
✓ Upgraded Gemini AI to analyze actual photo/video content, not just metadata
✓ AI now processes both visual evidence and text descriptions for comprehensive scoring
✓ Individual audit items analyzed with advanced image recognition capabilities
✓ Consolidated reviewer workflow from two buttons to single comprehensive analysis
✓ Enhanced analysis looks for cleanliness, brand compliance, operational standards in images
✓ Added hotel background imagery to auditor dashboard with pale yellow overlay

✓ **PROJECT MIGRATION COMPLETED: Successfully migrated hotel audit platform to standard Replit environment**
✓ **Database Migration**: PostgreSQL database configured with proper environment variables
✓ **AI Integration**: Gemini API key configured for intelligent audit analysis  
✓ **Application Launch**: Server running on port 5000 with all dashboards functional
✓ **Authentication**: Role-based login system operational with demo credentials
✓ **Replit Environment Setup**: Configured PostgreSQL database, ran migrations, seeded demo data
✓ **AI Integration Active**: Gemini API key configured, AI-powered audit analysis fully operational
✓ **All Dashboards Functional**: Admin, Auditor, Reviewer, Corporate, and Hotel GM interfaces working
✓ **Authentication System**: Role-based login system with demo credentials operational
✓ **Database Migration: Converted and configured PostgreSQL database with proper connection**
✓ **Fixed Admin Dashboard: Resolved scoring display issue in completed audits view details**
✓ **Fixed Reviewer Dashboard: Implemented proper filtering to show only submitted audits**
✓ **Database Reset: Cleaned and reseeded database with fresh demo data**
✓ Successfully migrated project from Replit Agent to Replit environment
✓ Fixed admin dashboard scoring display issues - scores now show properly instead of 'N/A'
✓ Fixed reviewer dashboard filtering - now only shows audits submitted by auditors
✓ Converted database schema from SQLite to PostgreSQL
✓ Set up PostgreSQL database with proper connection and seeding
✓ Fixed all dependency and configuration issues
✓ Created comprehensive User Flow Demo showcasing all 5 personas
✓ Application running successfully with all dashboards functional
✓ Enhanced Admin Dashboard with approved audits detailed view
✓ Added new "Approved Audits" tab with comprehensive audit details
✓ Implemented audit items display with scores and comments
✓ Added proper audit status management including "approved" state
✓ Enhanced Auditor Dashboard with tile-based layout for pending/completed audits
✓ Added property names instead of property IDs for better user experience
✓ Implemented tabbed interface organizing audits by status with summary statistics
✓ Added detailed audit cards with property locations, dates, scores, and action buttons
✓ **MAJOR: Implemented AI-powered audit analysis using Gemini AI**
✓ Individual checklist item analysis with detailed AI feedback and scoring (0-5 scale)
✓ Reviewer dashboard enhanced with AI analysis tab showing individual item scores
✓ Score override functionality allowing reviewers to modify AI-generated scores
✓ Intelligent fallback scoring system when API limits are reached
✓ Overall score calculation based on individual item assessments
✓ Comprehensive AI insights with specific recommendations for each audit item
✓ **MAJOR: Implemented real-time data integration across all dashboards**
✓ Corporate dashboard now displays live audit data instead of static content
✓ Hotel GM dashboard shows real-time property performance and audit results
✓ Interactive survey creation functionality for corporate users
✓ Recommendation system enabling corporate team to send targeted improvements
✓ Feedback system allowing Hotel GMs to communicate directly with corporate
✓ Real-time KPI calculations based on live audit submissions and reviews
✓ Auto-refreshing data every 30 seconds across all dashboards
✓ **MAJOR: Enhanced SOP functionality with file upload support**
✓ Added file upload component supporting PDF, DOCX, DOC, PNG, JPG formats
✓ Updated audit scheduling form to include SOP file uploads instead of text input
✓ Enhanced database schema to store SOP file metadata (names, types, sizes, URLs)
✓ Implemented drag-and-drop file upload with validation and preview
✓ Added hotel group-specific default SOP files that auto-load during audit scheduling
✓ File size limits (10MB per file, 5 files max) with proper error handling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state, React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: PostgreSQL session store (connect-pg-simple)
- **API Design**: RESTful endpoints with structured error handling
- **Build System**: ESBuild for production bundling

## Key Components

### Authentication System
- Role-based authentication supporting 5 user personas
- Traditional login page with username/password form
- Protected routes with role-specific access control
- Session persistence with localStorage fallback
- Login/logout functionality with proper state management
- Demo credentials for all personas (username/password: role/password)

### Database Schema
- **Users**: Role-based user system with credentials and metadata
- **Properties**: Hotel properties with location, scores, and status tracking
- **Audits**: Comprehensive audit records with scores, findings, and action plans
- **Audit Items**: Granular audit checklist items with scoring and media attachments

### Role-Based Dashboards
- **Admin Dashboard**: Audit scheduling, auditor assignment, progress tracking
- **Auditor Dashboard**: Field auditing interface, media upload, draft reports
- **Reviewer Dashboard**: AI-powered analysis, individual item scoring, score override capabilities, comprehensive review and approval workflow
- **Corporate Dashboard**: Analytics overview, compliance tracking, performance metrics
- **Hotel GM Dashboard**: Property-specific results, action plans, compliance status

### UI Component System
- Consistent design system using Shadcn/ui components
- Role-specific color coding and theming
- Responsive design with mobile-first approach
- Comprehensive component library (cards, forms, navigation, charts, etc.)

## Data Flow

1. **Authentication Flow**: User selects role → Login credentials → Role-based dashboard redirect
2. **Audit Creation**: Admin creates audit → Assigns to auditor → Auditor receives task
3. **Audit Execution**: Auditor completes checklist → Uploads media → Submits for review
4. **Review Process**: Reviewer validates → AI analysis integration → Score finalization
5. **Reporting**: Generate compliance reports → Action plan creation → Stakeholder distribution

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack React Query
- **UI Components**: Radix UI primitives, Lucide React icons, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Neon database
- **AI Integration**: Google Gemini AI for intelligent audit analysis and scoring
- **Development**: Vite, TypeScript, ESLint, PostCSS
- **Utilities**: Zod validation, date-fns, clsx for styling

### Database Integration
- Drizzle Kit for database migrations
- PostgreSQL dialect with Neon serverless provider
- Connection pooling and session management
- Schema-first database design with TypeScript integration

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Replit integration with runtime error overlay
- Development-specific middleware and logging
- File serving and static asset handling

### Production Build
- Vite builds client-side React application to `dist/public`
- ESBuild bundles server-side Express application to `dist`
- Environment-specific configuration management
- Static file serving from Express in production

### Database Management
- Environment-based DATABASE_URL configuration
- Drizzle migrations in `./migrations` directory
- PostgreSQL schema validation and type safety
- Connection management with proper error handling

### Scalability Considerations
- Designed to handle 500+ audits per day
- Stateless server architecture for horizontal scaling
- Database connection pooling for performance
- Asset optimization and caching strategies