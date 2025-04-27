<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FinancialProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FinancialProductController extends Controller
{
    /**
     * Display a listing of the financial products.
     */
    public function index()
    {
        $products = FinancialProduct::orderBy('name')->get();
        return response()->json($products);
    }

    /**
     * Store a newly created financial product in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:50',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'term_months' => 'nullable|integer|min:1',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0|gte:min_amount',
            'requirements' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = FinancialProduct::create($request->all());
        return response()->json($product, 201);
    }

    /**
     * Display the specified financial product.
     */
    public function show(FinancialProduct $financialProduct)
    {
        return response()->json($financialProduct);
    }

    /**
     * Update the specified financial product in storage.
     */
    public function update(Request $request, FinancialProduct $financialProduct)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|max:50',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'term_months' => 'nullable|integer|min:1',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0|gte:min_amount',
            'requirements' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $financialProduct->update($request->all());
        return response()->json($financialProduct);
    }

    /**
     * Remove the specified financial product from storage.
     */
    public function destroy(FinancialProduct $financialProduct)
    {
        // Check if there are any loan applications using this product
        if ($financialProduct->loanApplications()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete this financial product because it has associated loan applications.'
            ], 422);
        }

        $financialProduct->delete();
        return response()->json(null, 204);
    }
} 