<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '1234567890',
            'address' => '123 Admin Street',
            'business_name' => 'AgriConnect Admin',
            'bio' => 'System Administrator',
        ]);

        // Create farmer user
        User::create([
            'name' => 'Panda Farmer',
            'email' => 'farmer@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'farmer',
            'phone' => '0987654321',
            'address' => '456 Farm Road',
            'business_name' => 'Green Valley Farms',
            'bio' => 'Organic farmer specializing in seasonal vegetables',
        ]);

        // Create buyer user
        User::create([
            'name' => 'Fox Buyer',
            'email' => 'buyer@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'buyer',
            'phone' => '1122334455',
            'address' => '789 Market Street',
            'business_name' => 'Fresh Market Co.',
            'bio' => 'Wholesale buyer for local markets',
        ]);
    }
} 