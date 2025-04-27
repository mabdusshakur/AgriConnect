<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_id',
        'name',
        'description',
        'amount',
        'type', // income or expense
        'category',
        'due_date',
        'is_recurring',
        'recurring_frequency', // monthly, weekly, yearly
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'is_recurring' => 'boolean',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the budget that owns the item.
     */
    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }
} 