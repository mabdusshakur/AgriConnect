<?php

namespace App\Http\Controllers;

use App\Models\FinancialProduct;
use App\Models\LoanApplication;
use App\Models\LoanDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LoanApplicationController extends Controller
{
    /**
     * Display a listing of the user's loan applications.
     */
    public function index()
    {
        $applications = LoanApplication::where('user_id', auth()->id())
            ->with(['documents', 'financialProduct'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    public function adminIndex()
    {
        $applications = LoanApplication::with(['user', 'documents', 'financialProduct'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Store a newly created loan application in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'financial_product_id' => 'required|exists:financial_products,id',
            'amount' => 'required|numeric|min:0',
            'purpose' => 'required|string',
            'term_months' => 'required|integer|min:1',
            'interest_rate' => 'required|numeric|min:0',
            'documents.*' => 'nullable|file|max:10240', // Max 10MB per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if the financial product exists and is active
        $product = FinancialProduct::findOrFail($request->financial_product_id);
        if (!$product->is_active) {
            return response()->json(['message' => 'This financial product is not available.'], 422);
        }

        // Check if the amount is within the allowed range
        if ($product->min_amount && $request->amount < $product->min_amount) {
            return response()->json(['message' => 'The amount is below the minimum allowed.'], 422);
        }
        if ($product->max_amount && $request->amount > $product->max_amount) {
            return response()->json(['message' => 'The amount is above the maximum allowed.'], 422);
        }

        // Create the loan application
        $application = LoanApplication::create([
            'user_id' => auth()->id(),
            'financial_product_id' => $request->financial_product_id,
            'amount' => $request->amount,
            'purpose' => $request->purpose,
            'term_months' => $request->term_months,
            'interest_rate' => $request->interest_rate,
            'status' => 'pending'
        ]);

        // Handle document uploads if any
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $index => $file) {
                // Store the file
                $path = $file->store('loan-documents', 'public');
                
                // Create document record
                LoanDocument::create([
                    'loan_application_id' => $application->id,
                    'document_type' => 'supporting_document',
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => auth()->id(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Loan application submitted successfully',
            'data' => $application->load('documents')
        ], 201);
    }

    /**
     * Display the specified loan application.
     */
    public function show($id)
    {
        $application = LoanApplication::with(['documents', 'financialProduct'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    /**
     * Upload a document for the loan application.
     */
    public function uploadDocument(Request $request, LoanApplication $loanApplication)
    {
        // Check if the user is authorized to upload documents for this application
        if ($loanApplication->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'document_type' => 'required|string|max:50',
            'document' => 'required|file|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store the file
        $file = $request->file('document');
        $path = $file->store('loan-documents', 'public');

        // Create the document record
        $document = LoanDocument::create([
            'loan_application_id' => $loanApplication->id,
            'document_type' => $request->document_type,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => Auth::id(),
        ]);

        return response()->json($document, 201);
    }

    /**
     * Delete a document from the loan application.
     */
    public function deleteDocument(LoanApplication $loanApplication, LoanDocument $document)
    {
        // Check if the user is authorized to delete this document
        if ($loanApplication->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Check if the document belongs to the loan application
        if ($document->loan_application_id !== $loanApplication->id) {
            return response()->json(['message' => 'Document not found.'], 404);
        }

        // Delete the file from storage
        Storage::disk('public')->delete($document->file_path);

        // Delete the document record
        $document->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_review,approved,rejected',
            'admin_notes' => 'nullable|string',
            'rejection_reason' => 'required_if:status,rejected|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $application = LoanApplication::findOrFail($id);
        $application->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'rejection_reason' => $request->rejection_reason,
            'approved_at' => $request->status === 'approved' ? now() : null,
            'rejected_at' => $request->status === 'rejected' ? now() : null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Application status updated successfully',
            'data' => $application
        ]);
    }
} 