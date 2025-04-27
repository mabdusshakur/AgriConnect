<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = auth()->user();
        \Log::info('Fetching orders for user:', ['user_id' => $user->id, 'role' => $user->role]);
        

        \Log::info('All request:', [$request->all()]);
        $query = Order::with(['items.product.images', 'buyer', 'farmer']);

        if ($user->role === 'farmer') {
            $query->where('farmer_id', $user->id);
        } else {
            $query->where('buyer_id', $user->id);
        }

        // Apply filters
        if ($request->has('status' && isset($request->status))) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && isset($request->date_from)) {
            $query->whereDate('created_at', '>=', date('Y-m-d', strtotime($request->date_from)));
        }

        if ($request->has('date_to') && isset($request->date_to)) {
            $query->whereDate('created_at', '<=', date('Y-m-d', strtotime($request->date_to)));
        }

        $orders = $query->latest()->paginate(10);
        \Log::info('Found orders:', [
            'count' => $orders->count(),
            'total' => $orders->total(),
            'current_page' => $orders->currentPage(),
            'per_page' => $orders->perPage(),
            'last_page' => $orders->lastPage()
        ]);

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string|in:cash,card',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Calculate total amount
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $totalAmount += $product->price * $item['quantity'];
            }

            // Create order
            $order = Order::create([
                'buyer_id' => auth()->id(),
                'farmer_id' => Product::find($request->items[0]['product_id'])->farmer_id,
                'total_amount' => $totalAmount,
                'shipping_address' => $request->shipping_address,
                'payment_method' => $request->payment_method,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Create order items and update product quantities
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient quantity for product: {$product->title}");
                }

                $subtotal = $product->price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ]);

                // Update product quantity
                $product->decrement('quantity', $item['quantity']);
                if ($product->quantity === 0) {
                    $product->update(['is_available' => false]);
                }
            }

            DB::commit();

            return response()->json($order->load('items.product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show(Order $order)
    {
        return response()->json($order->load('items.product', 'buyer', 'farmer'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->update(['status' => $request->status]);

        return response()->json($order);
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $validator = Validator::make($request->all(), [
            'payment_status' => ['required', 'string', Rule::in(['pending', 'paid', 'failed'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->update(['payment_status' => $request->payment_status]);

        return response()->json($order);
    }

    public function cancel(Order $order)
    {
        $this->authorize('cancel', $order);

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Only pending orders can be cancelled'], 400);
        }

        try {
            DB::beginTransaction();

            // Restore product quantities
            foreach ($order->items as $item) {
                $product = $item->product;
                $product->increment('quantity', $item->quantity);
                $product->update(['is_available' => true]);
            }

            $order->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json($order);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function complete(Order $order)
    {
        $this->authorize('complete', $order);
        
        $order->update(['status' => 'completed']);
        
        return response()->json([
            'message' => 'Order marked as completed successfully',
            'order' => $order
        ]);
    }

} 