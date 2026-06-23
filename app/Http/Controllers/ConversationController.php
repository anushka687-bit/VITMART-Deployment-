<?php

namespace App\Http\Controllers;

use App\Models\{Conversation, Message, Product};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $conversations = Conversation::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['product', 'buyer', 'seller', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->orderByDesc('updated_at')
            ->get();
        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'message'    => 'required|string|max:1000',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $product = Product::findOrFail($request->product_id);
        if ($product->user_id === $request->user()->id) {
            return response()->json(['message' => 'Cannot message yourself.'], 422);
        }

        $conversation = Conversation::firstOrCreate([
            'product_id' => $request->product_id,
            'buyer_id'   => $request->user()->id,
            'seller_id'  => $product->user_id,
        ]);

        $msg = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body'      => $request->message,
        ]);
        $conversation->touch();

        return response()->json(['conversation' => $conversation, 'message' => $msg], 201);
    }

    public function messages(Request $request, int $id)
    {
        $conversation = Conversation::findOrFail($id);
        $user = $request->user();
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403);
        }
        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();
        return response()->json($messages);
    }

    public function sendMessage(Request $request, int $id)
    {
        $v = Validator::make($request->all(), ['body' => 'required|string|max:1000']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $conversation = Conversation::findOrFail($id);
        $user = $request->user();
        if ($conversation->buyer_id !== $user->id && $conversation->seller_id !== $user->id) {
            abort(403);
        }
        $msg = $conversation->messages()->create(['sender_id' => $user->id, 'body' => $request->body]);
        $conversation->touch();
        return response()->json($msg->load('sender'), 201);
    }
}
