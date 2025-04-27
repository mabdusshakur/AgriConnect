<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'farmer', 'buyer'])->default('buyer');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('business_name')->nullable();
            $table->text('bio')->nullable();
            $table->string('profile_image')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'address', 'business_name', 'bio', 'profile_image']);
        });
    }
}; 