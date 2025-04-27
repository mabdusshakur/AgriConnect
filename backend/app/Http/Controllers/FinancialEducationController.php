<?php

namespace App\Http\Controllers;

use App\Models\FinancialEducation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FinancialEducationController extends Controller
{
    public function index()
    {
        $resources = FinancialEducation::where('is_active', true)
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $resources
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|in:budgeting,saving,investing,debt,tax',
            'url' => 'required|url',
            'thumbnail' => 'nullable|url',
            'read_time' => 'required|integer|min:1',
            'type' => 'required|string|in:article,video',
            'display_order' => 'required|integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $resource = FinancialEducation::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Resource created successfully',
            'data' => $resource
        ], 201);
    }

    public function show($id)
    {
        $resource = FinancialEducation::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $resource
        ]);
    }

    public function update(Request $request, $id)
    {
        $resource = FinancialEducation::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'string',
            'category' => 'string|in:budgeting,saving,investing,debt,tax',
            'url' => 'url',
            'thumbnail' => 'nullable|url',
            'read_time' => 'integer|min:1',
            'type' => 'string|in:article,video',
            'display_order' => 'integer|min:0',
            'is_active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $resource->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Resource updated successfully',
            'data' => $resource
        ]);
    }

    public function destroy($id)
    {
        $resource = FinancialEducation::findOrFail($id);
        $resource->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resource deleted successfully'
        ]);
    }
} 