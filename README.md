# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an equipment borrowing and return system (ระบบยืมคืนอุปกรณ์) for RMUTI (Rajamangala University of Technology Isan). The application is a full-stack web system built with React (client) and Node.js/Express (servers).

## Repository Structure

The project is organized as a monorepo with two main directories:
- `client/` - React frontend application (Vite + React + TailwindCSS + DaisyUI)
- `servers/` - Node.js/Express backend API server

## Development Commands

### Client (Frontend)
```bash
cd client
npm install                # Install dependencies
npm run dev               # Start development server (Vite)
npm run build             # Build for production
npm run lint              # Run ESLint
npm run preview           # Preview production build
```

### Server (Backend)
```bash
cd servers
npm install               # Install dependencies
npm start                 # Start server with nodemon (auto-reload on changes)
```

The server uses nodemon for development, which automatically restarts when files change.

## Environment Configuration

Both client and server require `.env` files (not tracked in git):

### Client `.env` Variables
- `VITE_REACT_APP_API_URL` - Backend API URL (e.g., http://localhost:3000)

### Server `.env` Variables
- `PORT` - Server port number
- `DB_HOST` - MySQL database host
- `DB_USER` - MySQL database user
- `DB_PASS` - MySQL database password
- `DB_NAME` - MySQL database name
- `JWT_SECRET` - Secret key for JWT token generation
- `channelAccessToken` - LINE Messaging API access token
- `channelSecret` - LINE Messaging API channel secret
- `recipientId` - LINE recipient ID for notifications

## Architecture

### Authentication & Authorization

The system implements JWT-based authentication with role-based access control:
- **Guest Routes**: Unauthenticated users (login, register)
- **User Routes**: Authenticated regular users (borrow equipment, view history)
- **Admin Routes**: Authenticated admin users (manage equipment, users, view reports)

**Authentication Flow:**
1. Client stores JWT token in localStorage after login
2. Token is sent via `Authorization: Bearer <token>` header
3. Server middleware (`servers/middleware/authenticate.js`) validates token and loads user data
4. React context (`client/src/contexts/AuthContext.jsx`) manages auth state globally

**Route Protection:**
- Routes are defined in `client/src/routes/AppRouter.jsx`
- The router conditionally renders GuestRoutes, UserLayout, or AdminLayout based on authentication status and role
- All routes are under `/RMUTI` base path

### Backend Architecture

**Database:** MySQL2 with direct connection (not pool) in `servers/config/db.js`

**API Structure:**
- `/api/equipment` - Equipment CRUD operations (equipmentRoutes.js)
- `/api/borrowRecords` - Borrow/return record management (borrowRecords.js)
- `/api/users` - User authentication and profile (userRoutes.js)
- `/api/stats` - Statistics/dashboard data (StatsSection.js)

**File Uploads:**
- Equipment images stored in `servers/uploads/` (served via `/uploads` static route)
- Return evidence images stored in `servers/image_return/` (served via `/image_return` static route)
- Images are compressed using Sharp middleware (`servers/middleware/upload.js`)
- Multer handles multipart/form-data uploads

**LINE Notifications:**
The system integrates LINE Messaging API (`servers/utils/lineNotify.js`) to send notifications with images when equipment is borrowed or returned.

### Frontend Architecture

**UI Framework:**
- TailwindCSS for utility-first styling
- DaisyUI for pre-built component themes
- tailwindcss-animated for animations
- React Icons for iconography
- SweetAlert2 for modals/alerts
- React Toastify for toast notifications

**State Management:**
- AuthContext provides global user state, authentication status, and borrow/return counts
- Custom `useAuth` hook wraps AuthContext for convenient access

**Key Frontend Components:**
- `Header.jsx` / `Herderadmin.jsx` - Navigation headers
- `Footer.jsx` - Site footer
- `StatsSection.jsx` - Dashboard statistics display
- `ImageUpload.jsx` / `CameraCapture.jsx` - Image upload interfaces
- `Return.jsx` - Equipment return form

**Admin Pages:**
All admin pages are in `client/src/pages/admin/`:
- `Dashboard.jsx` - Overview statistics
- `ManageTools.jsx` - Equipment inventory management
- `ManageUsers.jsx` - User account management
- `ListBorrow.jsx` / `ListReturn.jsx` - Borrow/return transaction lists
- `ReportBorrow.jsx` / `ReportDetails.jsx` / `ReportResults.jsx` - Reporting functionality
- `Activity.jsx` - Activity log
- `addTool.jsx` - Add new equipment form
- `EditModal.jsx` / `DeleteModal.jsx` - Reusable modals

## Key Technical Details

### JWT Token Payload Structure
The JWT token contains:
```javascript
{
  user: {
    user_id: number,
    student_email: string
  }
}
```

The authentication middleware verifies the token, then fetches full user data from the database and attaches it to `req.user`.

### Image Handling
Equipment and return evidence images are uploaded separately:
- Equipment images: `upload` middleware → compression → stored in `uploads/`
- Return images: `upload_return` middleware → stored in `image_return/`

All images use format: `RMUTI-{timestamp}.jpg`

### Database Queries
The backend uses callback-style MySQL2 queries in most places, with some promise-based queries (`.promise().query()`) in the authentication middleware.

## Common Development Workflows

### Adding a New API Endpoint
1. Add route handler in appropriate file in `servers/routes/`
2. Implement controller logic in `servers/controllers/`
3. Update authentication middleware if endpoint requires auth
4. Test endpoint manually or add to frontend

### Adding New Admin Page
1. Create component in `client/src/pages/admin/`
2. Add route to `adminRoutes` array in `client/src/routes/AdminRoutes.jsx`
3. Update admin navigation in `Herderadmin.jsx` if needed

### Modifying Authentication
Changes to auth logic should be made in:
- Backend: `servers/controllers/authController.js` and `servers/middleware/authenticate.js`
- Frontend: `client/src/contexts/AuthContext.jsx` and routes configuration
