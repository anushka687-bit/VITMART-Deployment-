<?php

namespace App\Http\Controllers;

use App\Models\{Conversation, Product, Review, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function index(int $userId)
    {
        User::findOrFail($userId);

        $reviews = Review::with('reviewer')
            ->where('reviewed_user_id', $userId)
            ->latest()
            ->get();

        return response()->json([
            'average_rating' => round((float) $reviews->avg('rating'), 1),
            'review_count'   => $reviews->count(),
            'reviews'        => $reviews,
        ]);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'reviewed_user_id' => 'required|integer|exists:users,id',
            'product_id'       => 'nullable|integer|exists:products,id',
            'rating'           => 'required|integer|min:1|max:5',
            'review'           => 'nullable|string|max:2000',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $reviewerId = $request->user()->id;
        $reviewedUserId = (int) $request->reviewed_user_id;
        $productId = $request->product_id ? (int) $request->product_id : null;

        if ($reviewerId === $reviewedUserId) {
            return response()->json(['message' => 'You cannot review yourself.'], 422);
        }

        if (!$this->hasCompletedTransaction($reviewerId, $reviewedUserId, $productId)) {
            return response()->json(['message' => 'You can only review this seller after a completed (sold) transaction.'], 403);
        }

        $existing = Review::where('user_id', $reviewerId)
            ->where('reviewed_user_id', $reviewedUserId)
            ->where('product_id', $productId)
            ->first();
        if ($existing) {
            return response()->json(['message' => 'You already reviewed this. Edit your existing review instead.', 'review' => $existing->load('reviewer')], 409);
        }

        $review = Review::create([
            'user_id'          => $reviewerId,
            'reviewed_user_id' => $reviewedUserId,
            'product_id'       => $productId,
            'rating'           => $request->rating,
            'review'           => $request->review,
        ]);

        return response()->json($review->load('reviewer'), 201);
    }

    public function update(Request $request, int $id)
    {
        $review = Review::findOrFail($id);
        if ($review->user_id !== $request->user()->id) abort(403);

        $v = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'review' => 'nullable|string|max:2000',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $review->update($v->validated());
        return response()->json($review->fresh()->load('reviewer'));
    }

    public function destroy(Request $request, int $id)
    {
        $review = Review::findOrFail($id);
        if ($review->user_id !== $request->user()->id) abort(403);

        $review->delete();
        return response()->json(['message' => 'Review deleted.']);
    }

    /**
     * This project has no dedicated "orders/transactions" table — a
     * completed transaction is proxied by: a sold product owned by the
     * reviewed user, with an existing buyer/seller conversation between
     * the two users on that product (or, for a general seller review
     * with no product_id, any sold product of theirs the reviewer has
     * a conversation on).
     */
    private function hasCompletedTransaction(int $reviewerId, int $reviewedUserId, ?int $productId): bool
    {
        if ($productId) {
            $product = Product::withTrashed()->find($productId);
            if (!$product || $product->user_id !== $reviewedUserId || $product->status !== 'sold') {
                return false;
            }
            return Conversation::where('product_id', $productId)
                ->where(function ($q) use ($reviewerId) {
                    $q->where('buyer_id', $reviewerId)->orWhere('seller_id', $reviewerId);
                })->exists();
        }

        return Conversation::where('seller_id', $reviewedUserId)
            ->where('buyer_id', $reviewerId)
            ->whereHas('product', fn ($q) => $q->where('status', 'sold'))
            ->exists();
    }
}
