# MERN Car Booking Application

A secure, full-stack car booking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring Stripe payment integration, comprehensive audit logging, and an admin dashboard.

## Features

### User Features
- User registration and authentication (JWT)
- Browse cars with filters (type, price, availability)
- Date-based car availability checking
- Book cars with extras (insurance, GPS, child seat)
- Secure payment processing via Stripe
- View booking history
- Leave reviews and ratings

### Admin Features
- Dashboard with analytics and charts
- Manage cars (CRUD operations)
- View and manage all bookings
- User management
- Activity audit logs
- Revenue reports

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers
- Comprehensive audit logging

## Tech Stack

- **Frontend:** React 18, React Router, Bootstrap 5, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Payment:** Stripe API
- **Authentication:** JWT + bcrypt

## Project Structure

```
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── context/        # React Context providers
│       ├── services/       # API service functions
│       └── styles/         # Custom CSS
├── server/                 # Node.js Backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
├── .env.example            # Environment variables template
└── package.json            # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Stripe account (for payment testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Final-Project-MERN-Based-Car-Booking-App
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Seed the database with sample cars:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/car-booking-app
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car by ID
- `GET /api/cars/search` - Search cars with filters
- `POST /api/cars` - Create car (Admin)
- `PUT /api/cars/:id` - Update car (Admin)
- `DELETE /api/cars/:id` - Delete car (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings` - Get all bookings (Admin)

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/car/:carId` - Get reviews for a car
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/audit-logs` - Get audit logs

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run seed` - Seed database with sample data
- `npm run build` - Build frontend for production

## Stripe Testing

Use Stripe test card numbers for payment testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Testing and Quality Assurance

### AI-Driven Testing with testRigor

This application was tested using testRigor, a no-code AI-powered testing platform that enables natural language test creation.

#### Test Cases Executed

1. **User Authentication Tests**
   - User registration with valid credentials - PASS
   - User login with correct email/password - PASS
   - Login failure with invalid credentials - PASS
   - Password validation requirements - PASS

2. **Car Browsing and Search Tests**
   - Display all available cars - PASS
   - Filter cars by type (SUV, Sedan, Luxury) - PASS
   - Filter cars by transmission (Automatic/Manual) - PASS
   - Filter cars by price range - PASS
   - Search cars by date availability - PASS

3. **Booking Flow Tests**
   - Select car and booking dates - PASS
   - Add extras (GPS, Insurance, Child Seat) - PASS
   - Calculate total price correctly - PASS
   - Complete checkout process - PASS

4. **Payment Processing Tests**
   - Stripe payment intent creation - PASS
   - Test card payment (4242 4242 4242 4242) - PASS
   - Payment confirmation and booking creation - PASS
   - Payment failure handling - PASS

5. **Admin Dashboard Tests**
   - Admin login and access - PASS
   - View dashboard statistics - PASS
   - Manage cars (create, update, delete) - PASS
   - View and manage bookings - PASS
   - View audit logs - PASS

### Algorithm Efficiency Analysis (Big O)

| Operation | Complexity | Status |
|-----------|------------|--------|
| Get all cars (with filters) | O(log n) | Optimized with indexes |
| Check car availability | O(log n) | Compound index on dates |
| Create booking | O(log n) | Efficient overlap detection |
| Calculate average rating | O(r log r) | Aggregation pipeline |
| Dashboard statistics | O(n log n) | Server-side aggregation |
| Search cars with dates | O(n log m) | Optimized with $lookup aggregation |

### Database Indexing Strategy

Optimized indexes implemented for performance:

- **Cars Collection:**
  - Text index on brand, model, description
  - Compound index on type, pricePerDay, available

- **Bookings Collection:**
  - Index on user + status
  - Compound index on car + startDate + endDate
  - Index on status + createdAt

- **Audit Logs Collection:**
  - Index on userId + createdAt
  - Index on action + createdAt

### Security Testing Results

| Security Feature | Status |
|-----------------|--------|
| JWT authentication | PASS |
| Password hashing (bcrypt) | PASS |
| Rate limiting (100 req/15min) | PASS |
| CORS configuration | PASS |
| Helmet security headers | PASS |
| Input sanitization | PASS |
| Audit logging (25+ action types) | PASS |

---

## Test Credentials

For testing the application:

- **Admin Account:** admin@carbooking.com / admin123
- **User Account:** john@example.com / password123

---

## License

MIT
