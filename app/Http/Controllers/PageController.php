<?php

namespace App\Http\Controllers;

use App\Models\{Category, Product};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Storage, Validator};

class PageController extends Controller
{
    public function home()
    {
        if (auth()->check() && auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return view('home');
    }

    public function login()
    {
        if (auth()->check()) {
            return auth()->user()->isAdmin()
                ? redirect()->route('admin.dashboard')
                : redirect()->route('home');
        }
        return view('auth.login');
    }
}
