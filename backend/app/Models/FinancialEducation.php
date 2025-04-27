<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialEducation extends Model
{
    use HasFactory;

    protected $table = 'financial_education';

    protected $fillable = [
        'title',
        'description',
        'category',
        'url',
        'thumbnail',
        'read_time',
        'type',
        'display_order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'read_time' => 'integer',
        'display_order' => 'integer'
    ];
} 