<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class GeneralController extends Controller
{
    public function getDashboardStats()
    {
        $totalCategories = Category::count();
        $totalUsers = User::count();
        $totalProducts = Product::count();
        $totalOrders = Order::count();

        return response()->json([
            'totalCategories' => $totalCategories,
            'totalUsers' => $totalUsers,
            'totalProducts' => $totalProducts,
            'totalOrders' => $totalOrders
        ]);
    }
} 