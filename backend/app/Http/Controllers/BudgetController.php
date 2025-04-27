<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BudgetController extends Controller
{
    /**
     * Display a listing of the user's budgets.
     */
    public function index()
    {
        $budgets = Budget::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $budgets
        ]);
    }

    /**
     * Store a newly created budget in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'monthly_income' => 'required|numeric|min:0',
            'monthly_expenses' => 'required|numeric|min:0',
            'savings_goal' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean'
        ]);

        $budget = Budget::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return response()->json([
            'success' => true,
            'data' => $budget
        ], 201);
    }

    /**
     * Display the specified budget.
     */
    public function show(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $budget->load('items');

        return response()->json([
            'success' => true,
            'data' => $budget
        ]);
    }

    /**
     * Update the specified budget in storage.
     */
    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'monthly_income' => 'numeric|min:0',
            'monthly_expenses' => 'numeric|min:0',
            'savings_goal' => 'numeric|min:0',
            'start_date' => 'date',
            'end_date' => 'date|after:start_date',
            'is_active' => 'boolean'
        ]);

        $budget->update($validated);

        return response()->json([
            'success' => true,
            'data' => $budget
        ]);
    }

    /**
     * Remove the specified budget from storage.
     */
    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $budget->delete();

        return response()->json([
            'success' => true,
            'message' => 'Budget deleted successfully'
        ]);
    }

    /**
     * Store a new budget item.
     */
    public function storeItem(Request $request, Budget $budget)
    {
        // Check if the user is authorized to add items to this budget
        if ($budget->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'required|in:income,expense,savings',
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|in:monthly,weekly,yearly,one-time',
            'due_date' => 'nullable|date',
            'is_recurring' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = $budget->items()->create($request->all());
        return response()->json($item, 201);
    }

    /**
     * Update the specified budget item.
     */
    public function updateItem(Request $request, Budget $budget, BudgetItem $item)
    {
        // Check if the user is authorized to update this item
        if ($budget->user_id !== Auth::id() || $item->budget_id !== $budget->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'category' => 'required|in:income,expense,savings',
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'frequency' => 'required|in:monthly,weekly,yearly,one-time',
            'due_date' => 'nullable|date',
            'is_recurring' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item->update($request->all());
        return response()->json($item);
    }

    /**
     * Remove the specified budget item.
     */
    public function destroyItem(Budget $budget, BudgetItem $item)
    {
        // Check if the user is authorized to delete this item
        if ($budget->user_id !== Auth::id() || $item->budget_id !== $budget->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $item->delete();
        return response()->json(null, 204);
    }
} 