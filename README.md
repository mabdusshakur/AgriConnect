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

![Screenshot 2025-04-27 at 10-09-02 Vite React](https://github.com/user-attachments/assets/99d976ea-72eb-4b89-a84f-8388e597f1d4)
![Screenshot 2025-04-27 at 10-09-20 Vite React](https://github.com/user-attachments/assets/c15e4766-0eb2-4197-a52a-4ceb543f17c5)
![Screenshot 2025-04-27 at 10-09-36 Vite React](https://github.com/user-attachments/assets/ffe5cd6d-34a5-4a35-a7d1-5fdf5ce9c6f6)
![Screenshot 2025-04-27 at 10-09-45 Vite React](https://github.com/user-attachments/assets/dd097a61-469a-46d6-b21e-3ee09a3a6190)
![Screenshot 2025-04-27 at 10-09-57 Vite React](https://github.com/user-attachments/assets/501f35a4-218f-4f33-9558-1b7f798798e0)
![Screenshot 2025-04-27 at 10-10-05 Vite React](https://github.com/user-attachments/assets/06283511-4879-4f87-bc0d-1a544a95cb32)
![Screenshot 2025-04-27 at 10-10-19 Vite React](https://github.com/user-attachments/assets/d1060e2c-8a74-4133-a7d8-43acf865aa2c)
![Screenshot 2025-04-27 at 10-10-42 Vite React](https://github.com/user-attachments/assets/745c15cb-930c-4af9-b9c5-f06a2d9db5e0)
![Screenshot 2025-04-27 at 10-13-52 Vite React](https://github.com/user-attachments/assets/3b504823-b891-4056-94cd-1a3ea9f5004e)
![Screenshot 2025-04-27 at 10-14-42 Vite React](https://github.com/user-attachments/assets/e895694a-ea62-494c-b5b3-990b056a7c15)
![Screenshot 2025-04-27 at 10-14-55 Vite React](https://github.com/user-attachments/assets/b651cf94-9876-4644-af51-704cb6149bb9)
![Screenshot 2025-04-27 at 10-15-10 Vite React](https://github.com/user-attachments/assets/2f696c2b-c53e-456b-85d9-76a0a8987f58)
![Screenshot 2025-04-27 at 10-15-40 Vite React](https://github.com/user-attachments/assets/fec8dafc-10a1-4836-9547-80f086f637e4)
![Screenshot 2025-04-27 at 10-16-10 Vite React](https://github.com/user-attachments/assets/e33da592-269c-45c9-afa6-da07d0cf8926)
![Screenshot 2025-04-27 at 10-16-16 Vite React](https://github.com/user-attachments/assets/40a5222d-ad85-4286-b8ad-757741d7a3ac)
![Screenshot 2025-04-27 at 10-16-34 Vite React](https://github.com/user-attachments/assets/7a951c96-4897-41b3-93a3-7711a1340895)
![Screenshot 2025-04-27 at 10-16-55 Vite React](https://github.com/user-attachments/assets/361514db-5b9a-4748-be10-12069d0754d4)
![Screenshot 2025-04-27 at 10-17-02 Vite React](https://github.com/user-attachments/assets/42b8af81-1b8f-4db1-9867-9731b73a1172)
![Screenshot 2025-04-27 at 10-17-10 Vite React](https://github.com/user-attachments/assets/2e062513-8255-4b33-af85-5326333462b9)
![Screenshot 2025-04-27 at 10-17-16 Vite React](https://github.com/user-attachments/assets/dcd8dd76-6f14-4840-9453-adbc748958b7)
