<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::with(['images', 'farmer', 'category'])
                ->where('is_available', true);

            // Apply filters
            if ($request->has('category') && $request->category) {
                $query->where('category', $request->category);
            }

            if ($request->has('minPrice') && $request->minPrice) {
                $query->where('price', '>=', $request->minPrice);
            }

            if ($request->has('maxPrice') && $request->maxPrice) {
                $query->where('price', '<=', $request->maxPrice);
            }

            if ($request->has('location') && $request->location) {
                $query->where('location', 'like', '%' . $request->location . '%');
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('description', 'like', '%' . $search . '%');
                });
            }

            // For farmer's products view
            if ($request->route()->getName() === 'farmer.products') {
                $query->where('farmer_id', Auth::id())
                      ->where('is_available', true);
            }

            $products = $query->paginate(12);

            // Transform the response to include full image URLs
            $products->through(function ($product) {
                $product->images->transform(function ($image) {
                    $image->image_path = URL::to('storage/' . $image->image_path);
                    return $image;
                });
                return $product;
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'items' => $products->items(),
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'last_page' => $products->lastPage(),
                        'per_page' => $products->perPage(),
                        'total' => $products->total()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'quantity' => 'required|integer|min:1',
                'category_id' => 'required|exists:categories,id',
                'location' => 'required|string|max:255',
                'is_available' => 'boolean',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::create([
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'category' => $request->category_id,
                'location' => $request->location,
                'farmer_id' => auth()->id(),
                'is_available' => $request->input('is_available', true)
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('product_images', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path
                    ]);
                }
            }

            // Load and transform images for response
            $product->load(['images', 'category']);
            $product->images->transform(function ($image) {
                $image->image_path = URL::to('storage/' . $image->image_path);
                return $image;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating product: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Product $product)
    {
        try {
            if (!$product->is_available && $product->farmer_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Product not found'
                ], 404);
            }
            $category = Category::find($product->category);
            $product->load(['images', 'farmer']);
            
            // Transform images to include full URLs
            $product->images->transform(function ($image) {
                $image->image_path = URL::to('storage/' . $image->image_path);
                return $image;
            });
            
            $product->category = $category->name;

 
            return response()->json([
                'status' => 'success',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Product $product)
    {
        try {
            if ($product->farmer_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'quantity' => 'required|integer|min:1',
                'category_id' => 'required|exists:categories,id',
                'location' => 'required|string|max:255',
                'is_available' => 'boolean',
                'images.*' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
                'existing_images.*' => 'sometimes|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update product details
            $product->fill([
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'category' => $request->category_id,
                'location' => $request->location,
                'is_available' => $request->input('is_available', true)
            ]);
            $product->save();

            // Handle images only if there are changes
            if ($request->hasFile('images') || $request->has('existing_images')) {
                $imagesToKeep = $request->input('existing_images', []);
                
                // Only process image deletion if we have images to keep
                if (!empty($imagesToKeep)) {
                    // Get existing image paths
                    $existingImagePaths = $product->images->pluck('image_path')->toArray();
                    
                    // Delete images that are not in the keep list
                    foreach ($existingImagePaths as $imagePath) {
                        $storagePath = str_replace('storage/', '', $imagePath);
                        if (!in_array($imagePath, $imagesToKeep)) {
                            Storage::disk('public')->delete($storagePath);
                            $product->images()->where('image_path', $storagePath)->delete();
                        }
                    }
                }

                // Add new images if any are uploaded
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $image) {
                        $path = $image->store('product_images', 'public');
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $path
                        ]);
                    }
                }
            }

            // Load and transform images for response
            $product->load(['images', 'category']);
            $product->images->transform(function ($image) {
                $image->image_path = URL::to('storage/' . $image->image_path);
                return $image;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => $product
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Product $product)
    {
        try {
            if ($product->farmer_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Delete images from storage
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }

            $product->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function farmerProducts()
    {
        try {
            $products = Product::with(['images', 'farmer', 'category'])
                ->where('farmer_id', Auth::id())
                ->paginate(12);

            // Transform the response to include full image URLs
            $products->through(function ($product) {
                $product->images->transform(function ($image) {
                    $image->image_path = URL::to('storage/' . $image->image_path);
                    return $image;
                });
                return $product;
            });

            return response()->json([
                'status' => 'success',
                'data' => $products
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching farmer products: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch farmer products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteImage(Product $product, $imageId)
    {
        try {
            if ($product->farmer_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Find the image by ID
            $image = $product->images()->find($imageId);
            
            if (!$image) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Image not found'
                ], 404);
            }

            // Delete from storage
            $storagePath = str_replace('storage/', '', $image->image_path);
            Storage::disk('public')->delete($storagePath);

            // Delete from database
            $image->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Image deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting image: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 