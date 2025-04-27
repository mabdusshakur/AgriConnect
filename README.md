# AgriConnect

This is **AgriConnect**, a full-stack platform designed to connect farmers, buyers, and administrators. The project consists of a Laravel backend and a React frontend (located in the `/frontend` directory), providing features such as product listings, order management, financial education, budgeting, loan applications, and disease alerts.

## Features

- **User Authentication**: Register, login, and manage user sessions (using Laravel Sanctum).
- **Role-based Access**: Separate routes and permissions for farmers, buyers, and admins.
- **Product Management**: Farmers can create, update, and delete products; buyers can browse products.
- **Order Management**: Place, view, update, and manage orders.
- **Category Management**: Admins can manage product categories.
- **Financial Education**: Access and manage financial education resources.
- **Budgeting Tools**: Create and manage budgets and budget items.
- **Loan Applications**: Apply for loans, upload documents, and track application status.
- **Financial Products**: View and manage financial products (admin and user).
- **Disease Alerts**: View and manage crop disease alerts, including region and crop type filtering.
- **RESTful API**: Well-structured API endpoints for all features.

## Tech Stack

- **Backend**:
  - **PHP 8.2+**
  - **Laravel 12**
  - **MySQL or SQLite** (configurable)
  - **Laravel Sanctum** (API authentication)
  - **Vite** (asset bundling)
  - **Tailwind CSS** (styling)
  - **Node.js** (for asset compilation)

- **Frontend**:
  - **React**
  - **Vite**
  - **Tailwind CSS**

## Getting Started

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js & npm
- MySQL or SQLite

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mabdusshakur/agriconnect.git
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install Node dependencies:**
   ```bash
   npm install
   ```

4. **Copy the environment file and set your configuration:**
   ```bash
   cp .env.example .env
   ```
   - Set your database credentials and other environment variables in `.env`.

5. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

6. **Run migrations:**
   ```bash
   php artisan migrate
   ```

7. **(Optional) Seed the database:**
   ```bash
   php artisan db:seed
   ```

8. **Start the development server:**
   ```bash
   php artisan serve
   ```

9. **Start the asset watcher:**
   ```bash
   on : /frontend
   npm run dev
   ```

   Or, to run both backend and frontend together:
   ```bash
   on : /frontend
   npm run dev
   ```

## API Overview

- **Authentication:** `/api/register`, `/api/login`, `/api/logout`, `/api/me`
- **Products:** `/api/products`, `/api/products/{id}`, `/api/farmer/products`
- **Orders:** `/api/orders`, `/api/orders/{id}`, `/api/orders/{id}/status`
- **Categories:** `/api/categories`, `/api/admin/categories`
- **Financial Education:** `/api/financial-education`, `/api/admin/financial-education`
- **Budgets:** `/api/budgets`, `/api/budgets/{id}/items`
- **Loan Applications:** `/api/loan-applications`, `/api/admin/loan-applications`
- **Financial Products:** `/api/financial-products`, `/api/admin/financial-products`
- **Disease Alerts:** `/api/disease-alerts`, `/api/disease-alerts-public`

> For full API details, see the route definitions in `routes/api.php`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Although if your intention is to improve this src, just do it.


## NB
I didn't got enough time, i just had some around 20h free on my hand, i used it to create this project, & this is teh first react project i created :)).



## Some Screenshots
