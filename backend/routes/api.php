<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Models\User;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetItemController;
use App\Http\Controllers\FinancialEducationController;
use App\Http\Controllers\LoanApplicationController;
use App\Http\Controllers\LoanDocumentController;
use App\Http\Controllers\FinancialProductController;
use App\Http\Controllers\DiseaseAlertController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Public financial education routes
Route::get('/financial-education', [FinancialEducationController::class, 'index']);
Route::get('/financial-education/{id}', [FinancialEducationController::class, 'show']);

Route::get('/disease-alerts-public', [DiseaseAlertController::class, 'publicIndex']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'user']);

    // Product routes
    Route::middleware('role:farmer')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::get('/farmer/products', [ProductController::class, 'farmerProducts']);
    });

    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{order}/complete', [OrderController::class, 'complete']);
    Route::post('/orders/{order}/payment-status', [OrderController::class, 'updatePaymentStatus']);

    Route::get('/categories', [CategoryController::class, 'index']);

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('admin/categories', CategoryController::class);
        Route::get('/dashboard-stats', [App\Http\Controllers\Admin\GeneralController::class, 'getDashboardStats']);
        
        // Financial Education admin routes
        Route::post('/admin/financial-education', [FinancialEducationController::class, 'store']);
        Route::put('/admin/financial-education/{id}', [FinancialEducationController::class, 'update']);
        Route::delete('/admin/financial-education/{id}', [FinancialEducationController::class, 'destroy']);

        // Admin Loan Application routes
        Route::get('/admin/loan-applications', [LoanApplicationController::class, 'adminIndex']);
        Route::put('/admin/loan-applications/{id}/status', [LoanApplicationController::class, 'updateStatus']);

        // Admin Financial Products routes
        Route::post('/admin/financial-products', [FinancialProductController::class, 'store']);
        Route::put('/admin/financial-products/{id}', [FinancialProductController::class, 'update']);
        Route::delete('/admin/financial-products/{id}', [FinancialProductController::class, 'destroy']);
        Route::get('/admin/financial-products', [FinancialProductController::class, 'index']);
        Route::get('/admin/financial-products/{id}', [FinancialProductController::class, 'show']);
    });
    

    // Buyer routes
    Route::middleware('role:buyer')->group(function () {
        // Add buyer-specific routes here
    });

    Route::delete('/products/{product}/images/{image}', [ProductController::class, 'deleteImage']);


    // Get Role TEst
    Route::get('/get-roll', function (Request $request) {
        $user = User::where('email', $request->email)->first();
        return response()->json(['role' => $user->role]);
    });

    // Budget Routes
    Route::apiResource('budgets', BudgetController::class);
    Route::apiResource('budgets.items', BudgetItemController::class)->shallow();

    // Loan Application routes
    Route::get('/loan-applications', [LoanApplicationController::class, 'index']);
    Route::post('/loan-applications', [LoanApplicationController::class, 'store']);
    Route::get('/loan-applications/{id}', [LoanApplicationController::class, 'show']);
    Route::post('/loan-applications/{id}/documents', [LoanDocumentController::class, 'store']);
    Route::get('/loan-applications/{id}/documents', [LoanDocumentController::class, 'index']);

    // Financial Products routes
    Route::get('/financial-products', [FinancialProductController::class, 'index']);
    Route::get('/financial-products/{id}', [FinancialProductController::class, 'show']);

    // Disease Alerts Routes

    Route::get('/disease-alerts', [DiseaseAlertController::class, 'index']);
    Route::post('/disease-alerts', [DiseaseAlertController::class, 'store']);
    Route::get('/disease-alerts/{id}', [DiseaseAlertController::class, 'show']);
    Route::put('/disease-alerts/{id}', [DiseaseAlertController::class, 'update']);
    Route::delete('/disease-alerts/{id}', [DiseaseAlertController::class, 'destroy']);
    Route::get('/disease-alerts/regions', [DiseaseAlertController::class, 'regions']);
    Route::get('/disease-alerts/crop-types', [DiseaseAlertController::class, 'cropTypes']);
});
