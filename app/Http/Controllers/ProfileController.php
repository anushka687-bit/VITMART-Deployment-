<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Storage, Validator};

class ProfileController extends Controller
{
    // Session-based profile update (Blade form)
    public function updateProfile(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'phone'      => 'nullable|string|max:15',
            'block'      => 'nullable|string|max:100',
            'show_phone' => 'nullable|boolean',
            'avatar'     => 'nullable|image|max:2048',
        ]);
        if ($v->fails()) return back()->withErrors($v)->withInput();

        $user = auth()->user();
        $data = $request->only(['name', 'phone', 'block']);
        $data['show_phone'] = $request->boolean('show_phone');

        if ($request->hasFile('avatar')) {
            if ($user->avatar) Storage::disk('public')->delete($user->avatar);
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }
        $user->update($data);
        return back()->with('success', 'Profile updated successfully!');
    }

    public function uploadAvatarSession(Request $request)
    {
        $v = Validator::make($request->all(), ['avatar' => 'required|image|max:2048']);
        if ($v->fails()) return back()->withErrors($v);
        $user = auth()->user();
        if ($user->avatar) Storage::disk('public')->delete($user->avatar);
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);
        return back()->with('success', 'Avatar updated.');
    }

    // API methods
    public function show(Request $request)
    {
        return response()->json($request->user()->load('products'));
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
