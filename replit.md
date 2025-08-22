# Zaplog - Sistema de Gestão Logística

## Overview

Zaplog is an integrated logistics management system that connects WhatsApp Web with a web dashboard through a Chrome extension. The system allows logistics companies to manage trips by creating, tracking, and monitoring drivers and deliveries through an automated workflow that integrates with WhatsApp for real-time communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for consistent, accessible design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state management with React hooks for local state
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT token-based authentication with bcrypt password hashing
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Validation**: Zod schemas for runtime type validation on both frontend and backend

### Database Design
- **Primary Database**: PostgreSQL using Neon serverless for scalability
- **Schema Management**: Drizzle Kit for database migrations and schema changes
- **Key Tables**:
  - Users: Authentication and plan management (free/standard/pro tiers)
  - Trips: Core logistics data including driver info, routes, status tracking
- **Relationships**: Foreign key constraints ensuring data integrity

### Chrome Extension Integration
- **Manifest V3**: Modern extension architecture for security and performance
- **Components**:
  - Background Service Worker: Handles cross-component communication
  - Content Script: Extracts contact information from WhatsApp Web
  - Popup Interface: Quick trip creation and status overview
- **WhatsApp Integration**: Automated contact extraction and context menu integration

### Authentication & Authorization
- **JWT Implementation**: Stateless authentication with secure token storage
- **Protected Routes**: Middleware-based route protection on both frontend and backend
- **Plan-based Limits**: Tiered access control based on user subscription level
- **Session Management**: Automatic token refresh and logout handling

### Data Flow Architecture
1. **WhatsApp Integration**: Extension extracts contact data from active WhatsApp conversations
2. **Trip Creation**: Data flows from extension popup to web dashboard via API
3. **Real-time Updates**: Dashboard displays live trip status and driver information
4. **Plan Enforcement**: System enforces trip limits based on user's subscription tier

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connectivity for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **@tanstack/react-query**: Server state management and caching layer
- **wouter**: Lightweight routing library for React applications

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Icon library for consistent iconography

### Development & Build Tools
- **vite**: Frontend build tool and development server
- **typescript**: Static type checking and enhanced development experience
- **@replit/vite-plugin-runtime-error-modal**: Development debugging tools for Replit environment
- **@replit/vite-plugin-cartographer**: Development environment enhancements

### Authentication & Security
- **bcrypt**: Password hashing library for secure user authentication
- **jsonwebtoken**: JWT token generation and verification
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Form Handling & Validation
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Integration layer between React Hook Form and validation libraries
- **zod**: TypeScript-first schema validation for runtime type checking
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation schemas

### Chrome Extension APIs
- **chrome.contextMenus**: Right-click menu integration in WhatsApp Web
- **chrome.tabs**: Tab management and messaging between extension components
- **chrome.storage**: Local storage for extension data persistence
- **chrome.scripting**: Dynamic script injection for WhatsApp Web integration