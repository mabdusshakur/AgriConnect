<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'monthly_income',
        'monthly_expenses',
        'savings_goal',
        'start_date',
        'end_date',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'monthly_income' => 'decimal:2',
        'monthly_expenses' => 'decimal:2',
        'savings_goal' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the budget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the budget.
     */
    public function items(): HasMany
    {
        return $this->hasMany(BudgetItem::class);
    }

    public function incomeItems()
    {
        return $this->items()->where('type', 'income');
    }

    public function expenseItems()
    {
        return $this->items()->where('type', 'expense');
    }
} 