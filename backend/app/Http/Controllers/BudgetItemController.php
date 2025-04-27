<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BudgetItemController extends Controller
{
    public function index(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $items = $budget->items()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function store(Request $request, Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'is_recurring' => 'boolean',
            'recurring_frequency' => 'nullable|string|required_if:is_recurring,true',
            'is_paid' => 'boolean'
        ]);

        $item = $budget->items()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $item
        ], 201);
    }

    public function show(Budget $budget, BudgetItem $item)
    {
        if ($budget->user_id !== Auth::id() || $item->budget_id !== $budget->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    public function update(Request $request, Budget $budget, BudgetItem $item)
    {
        if ($budget->user_id !== Auth::id() || $item->budget_id !== $budget->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'amount' => 'numeric|min:0',
            'type' => 'in:income,expense',
            'category' => 'string|max:255',
            'due_date' => 'nullable|date',
            'is_recurring' => 'boolean',
            'recurring_frequency' => 'nullable|string|required_if:is_recurring,true',
            'is_paid' => 'boolean'
        ]);

        $item->update($validated);

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    public function destroy(Budget $budget, BudgetItem $item)
    {
        if ($budget->user_id !== Auth::id() || $item->budget_id !== $budget->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget item deleted successfully'
        ]);
    }
} 