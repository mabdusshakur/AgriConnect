<?php

namespace App\Http\Controllers;

use App\Models\LoanDocument;
use App\Models\LoanApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LoanDocumentController extends Controller
{
    public function index($applicationId)
    {
        $documents = LoanDocument::where('loan_application_id', $applicationId)
            ->whereHas('loanApplication', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    public function store(Request $request, $applicationId)
    {
        $validator = Validator::make($request->all(), [
            'document_type' => 'required|string',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if the application belongs to the user
        $application = LoanApplication::where('id', $applicationId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Store the file
        $file = $request->file('file');
        $path = $file->store('loan-documents', 'public');

        // Create the document record
        $document = LoanDocument::create([
            'loan_application_id' => $applicationId,
            'document_type' => $request->document_type,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'data' => $document
        ], 201);
    }

    public function destroy($applicationId, $documentId)
    {
        $document = LoanDocument::where('id', $documentId)
            ->where('loan_application_id', $applicationId)
            ->whereHas('loanApplication', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->firstOrFail();

        // Delete the file from storage
        Storage::disk('public')->delete($document->file_path);

        // Delete the document record
        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document deleted successfully'
        ]);
    }
} 