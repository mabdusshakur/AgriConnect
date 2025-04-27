<?php

namespace App\Http\Controllers;

use App\Models\FinancialProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FinancialProductController extends Controller
{
    public function index()
    {
        $products = FinancialProduct::where('is_active', true)
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|string|in:loan,insurance,investment',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'min_term_months' => 'nullable|integer|min:1',
            'max_term_months' => 'nullable|integer|min:1',
            'requirements' => 'nullable|array',
            'benefits' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = FinancialProduct::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Financial product created successfully',
            'data' => $product
        ], 201);
    }

    public function show($id)
    {
        $product = FinancialProduct::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'string',
            'type' => 'string|in:loan,insurance,investment',
            'interest_rate' => 'nullable|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'min_term_months' => 'nullable|integer|min:1',
            'max_term_months' => 'nullable|integer|min:1',
            'requirements' => 'nullable|array',
            'benefits' => 'nullable|array',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = FinancialProduct::findOrFail($id);
        $product->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Financial product updated successfully',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = FinancialProduct::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Financial product deleted successfully'
        ]);
    }
} 