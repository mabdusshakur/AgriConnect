<?php

namespace App\Http\Controllers;

use App\Models\DiseaseAlert;
use App\Models\DiseaseAlertImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DiseaseAlertController extends Controller
{
    /**
     * Display a listing of disease alerts.
     */
    public function index(Request $request)
    {
        $query = DiseaseAlert::with(['user', 'images'])
            ->orderBy('created_at', 'desc');


        // For non-admin users, only show verified alerts
        if (!Auth::user()->isAdmin()) {
            $query->where('status', 'verified');
        }

        $alerts = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $alerts
        ]);
    }

    public function publicIndex(Request $request)
    {
        $query = DiseaseAlert::with(['user', 'images'])
            ->orderBy('created_at', 'desc');



        $query->where('status', 'verified');


        $alerts = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $alerts
        ]);
    }

    /**
     * Store a newly created disease alert in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'crop_type' => 'required|string|max:255',
            'disease_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max per image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create the disease alert
            $alert = DiseaseAlert::create([
                'user_id' => Auth::id(),
                'title' => $request->title,
                'crop_type' => $request->crop_type,
                'disease_name' => $request->disease_name,
                'location' => $request->location,
                'description' => $request->description,
                'status' => 'pending'
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    // Store the image
                    $path = $image->store('disease-alerts', 'public');
                    
                    // Create the image record
                    DiseaseAlertImage::create([
                        'disease_alert_id' => $alert->id,
                        'image_path' => $path
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Disease alert created successfully',
                'data' => $alert->load('images')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create disease alert',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified disease alert.
     */
    public function show($id)
    {
        $alert = DiseaseAlert::with(['user', 'images'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $alert
        ]);
    }

    /**
     * Update the specified disease alert in storage.
     */
    public function update(Request $request, $id)
    {
        $alert = DiseaseAlert::findOrFail($id);

        // Only the creator or admin can update
        if ($alert->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'crop_type' => 'sometimes|required|string|max:100',
            'disease_name' => 'sometimes|required|string|max:100',
            'location' => 'sometimes|required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'region' => 'sometimes|required|string|max:100',
            'status' => 'sometimes|required|in:pending,verified,rejected',
            'admin_notes' => 'nullable|string',
            'images.*' => 'nullable|image|max:5120', // Max 5MB per image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the alert
        $alert->update($request->only([
            'title', 'description', 'crop_type', 'disease_name', 
            'location', 'latitude', 'longitude', 'region', 
            'status', 'admin_notes'
        ]));

        // If status is being updated to verified, set verified_at
        if ($request->has('status') && $request->status === 'verified') {
            $alert->verified_at = now();
            $alert->save();
        }

        // Handle additional image uploads if any
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                // Store the file
                $path = $file->store('disease-alerts', 'public');
                
                // Create image record
                DiseaseAlertImage::create([
                    'disease_alert_id' => $alert->id,
                    'image_path' => $path,
                    'caption' => $request->input("image_captions.{$index}")
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Disease alert updated successfully',
            'data' => $alert->load('images')
        ]);
    }

    /**
     * Remove the specified disease alert from storage.
     */
    public function destroy($id)
    {
        $alert = DiseaseAlert::findOrFail($id);

        // Only the creator or admin can delete
        if ($alert->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Delete associated images from storage
        foreach ($alert->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Delete the alert (this will cascade delete the images records)
        $alert->delete();

        return response()->json([
            'success' => true,
            'message' => 'Disease alert deleted successfully'
        ]);
    }

    /**
     * Get all regions for filtering
     */
    public function regions()
    {
        $regions = DiseaseAlert::distinct()->pluck('region');

        return response()->json([
            'success' => true,
            'data' => $regions
        ]);
    }

    /**
     * Get all crop types for filtering
     */
    public function cropTypes()
    {
        $cropTypes = DiseaseAlert::distinct()->pluck('crop_type');

        return response()->json([
            'success' => true,
            'data' => $cropTypes
        ]);
    }
} 