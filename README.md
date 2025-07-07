# Ecommerce Backend

This is a Node.js + Express + MongoDB backend for an E-commerce application. It provides a foundation for building a scalable API to be later connected with a frontend.

## Project Structure

- **src/config/**: Configuration files (e.g., database connection).
- **src/models/**: Mongoose models for MongoDB collections.
- **src/controllers/**: Handles incoming requests and responses.
- **src/routes/**: API endpoints.
- **src/services/**: Business logic and data manipulation.
- **src/middleware/**: Express middleware (e.g., error handling).
- **src/utils/**: Utility/helper functions.
- **tests/**: Unit and integration test files.
- **app.js**: Express app setup.
- **server.js**: Server entry point and environment setup.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values.
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run the server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

### API Example

A sample route is provided to fetch all products:

```
GET /api/products
```

This returns a list of products from the database.

## Next Steps

- Add more models (User, Order, Cart, etc.)
- Implement authentication and authorization middleware
- Add more routes and controllers
- Write tests in the `tests/` directory

---

Made with ❤️ for scalable backend development!