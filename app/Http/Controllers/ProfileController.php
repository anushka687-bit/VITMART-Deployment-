<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Storage, Validator};

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = User::withCount('reviewsReceived')
            ->withAvg('reviewsReceived', 'rating')
            ->with('products')
            ->findOrFail($request->user()->id);

        return response()->json($user);
    }

    public function update(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'       => 'sometimes|string|max:255',
            'phone'      => 'nullable|string|max:15',
            'block'      => 'nullable|string|max:100',
            'show_phone' => 'nullable|boolean',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);
        $request->user()->update($v->validated());
        return response()->json($request->user()->fresh());
    }

    public function uploadAvatar(Request $request)
    {
        $v = Validator::make($request->all(), ['avatar' => 'required|image|max:2048']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);
        $user = $request->user();
        if ($user->avatar) Storage::disk('public')->delete($user->avatar);
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);
        return response()->json(['avatar_url' => asset('storage/' . $path)]);
    }
}
