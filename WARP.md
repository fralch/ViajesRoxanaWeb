# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## About ViajesRoxanaWeb

ViajesRoxanaWeb is a travel management system for managing children's travel packages, groups, enrollments, and real-time tracking. The system provides parent portals, admin dashboards, GPS tracking, WhatsApp notifications, and NFC-based attendance confirmation.

## Technology Stack

- **Backend**: Laravel 12 (PHP 8.2+) with Inertia.js
- **Frontend**: React 18 with Tailwind CSS and Vite
- **Database**: MySQL with Eloquent ORM
- **Mapping**: Mapbox GL for geolocation and route tracking
- **Notifications**: Custom WhatsApp API integration via Factiliza
- **Authentication**: Laravel Sanctum with Breeze
- **Build Tools**: Vite for asset compilation

## Development Commands

### Initial Setup
```bash
# Install PHP dependencies
composer install

# Install Node dependencies 
npm install

# Copy environment file and configure database
cp .env.example .env
# Edit .env: set DB_DATABASE=viajesroxana, DB_USERNAME, DB_PASSWORD

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Build frontend assets
npm run build
```

### Development Server
```bash
# Start the full development stack (recommended)
composer run dev

# This runs concurrently:
# - php artisan serve (backend server)
# - php artisan queue:listen (background jobs)  
# - php artisan pail (logs monitoring)
# - npm run dev (Vite dev server)

# Alternative: Run servers individually
php artisan serve      # Backend server on http://localhost:8000
npm run dev            # Frontend dev server
```

### Testing
```bash
# Run all tests
composer run test

# Run tests with verbose output
php artisan test --verbose

# Run specific test file
php artisan test tests/Feature/HijoTest.php
```

### Database Operations
```bash
# Create fresh migration
php artisan make:migration create_example_table

# Refresh database with seed data
php artisan migrate:fresh --seed

# Create new seeder
php artisan make:seeder ExampleSeeder
```

### Maintenance Commands
```bash
# Clear all caches
php artisan optimize:clear

# Send WhatsApp notifications (custom command)
php artisan whatsapp:send-notifications

# Reset all user passwords (custom command)
php artisan users:reset-passwords
```

## Architecture Overview

### Core Domain Models
The application follows a hierarchical structure:
- **Users** → **Hijos** (Children) → **Inscripciones** (Enrollments)
- **Paquetes** (Packages) → **Grupos** (Groups) → **RecorridoPaquete** (Package Routes)
- **Geolocalizacion** (GPS Tracking) ↔ **Trazabilidad** (Attendance Tracking)
- **Notificaciones** (Notifications) with WhatsApp integration

### Key Relationships
- Users can have multiple children (Hijos)
- Children can have multiple enrollments (Inscripciones) in different groups
- Packages contain multiple groups with different capacities and schedules
- GPS tracking links to groups for real-time location monitoring
- NFC attendance system uses children's DNI for contactless check-ins

### Frontend Architecture
- **Inertia.js** bridges Laravel backend with React frontend
- **Layout System**: AuthenticatedLayout for admin, GuestLayout for public
- **Components**: Reusable UI components in `/resources/js/Components/`
- **Services**: Mapbox integration in `/resources/js/services/mapboxService.js`
- **Hooks**: Custom React hooks like `useGeolocation.js`

### Authentication & Authorization
- **Admin Dashboard**: Restricted to users with `is_admin = true`
- **Parent Portal**: Regular users can only view their children's information
- **Public Routes**: Enrollment forms and NFC attendance confirmation
- **API Routes**: Protected endpoints for location tracking and AJAX operations

## Special Features & Integrations

### WhatsApp Integration
- Uses Factiliza API for WhatsApp messaging
- Configuration in `config/services.php` with instance_id and token
- Service class: `App\Services\WhatsAppService`
- Sends login credentials and attendance notifications

### NFC/QR Attendance System
- Public routes: `/nfc/{dni_hijo}` for contactless check-ins
- Pre-confirmation and final confirmation workflow
- Automatic parent notifications via WhatsApp

### GPS Tracking
- Real-time location tracking for groups
- Mapbox integration for route visualization
- Location history and statistics endpoints
- Simulation endpoints for testing

### Database Configuration
- Primary database: MySQL with connection name 'mysql'
- Required database name: `viajesroxana`
- Session storage: database-backed
- Queue system: database-backed

## File Structure Notes

### Critical Configuration Files
- `vite.config.js`: Configures React + Laravel Vite plugin
- `tailwind.config.js`: Tailwind CSS configuration for React JSX files
- `routes/web.php`: Contains all web routes including public enrollment and NFC endpoints

### Important Directories
- `app/Models/`: Eloquent models with cascade delete relationships
- `app/Http/Controllers/`: Feature-specific controllers with proper resource routing
- `resources/js/Pages/`: Inertia.js React page components
- `resources/js/Components/`: Reusable React UI components
- `database/migrations/`: Database schema with proper foreign key relationships

## Environment Variables

Essential environment variables for development:
- `APP_URL`: Application base URL
- `DB_DATABASE=viajesroxana`: MySQL database name
- `VITE_APP_NAME`: Used in frontend build process
- WhatsApp API credentials (see `.env.example`)

## Common Development Patterns

### Adding New Models
1. Create migration: `php artisan make:migration create_table_name`
2. Create model: `php artisan make:model ModelName`
3. Define relationships in model
4. Add cascade deletes in model's `booted()` method if needed
5. Create controller: `php artisan make:controller ModelController --resource`
6. Add routes to `routes/web.php`

### Creating React Pages
1. Create page in `resources/js/Pages/PageName.jsx`
2. Use Inertia's `Head` component for page titles
3. Import and use appropriate layout (AuthenticatedLayout/GuestLayout)
4. Handle props passed from Laravel controllers

### Adding WhatsApp Notifications
1. Use `WhatsAppService::enviarMensajeTrazabilidad($phone, $message)`
2. Phone numbers are automatically prefixed with '51' (Peru country code)
3. All API calls are logged for debugging

The codebase emphasizes security, proper separation of concerns, and comprehensive logging for all critical operations.