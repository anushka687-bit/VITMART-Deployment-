<?php

use App\Http\Controllers\{
    AuthController, ProfileController, ProductController,
    FavouriteController, ConversationController, ReportController,
    CategoryController, AdminController, PageController
};
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

// ── Public Blade View Routes ─────────────────────────────────────
Route::get('/', [PageController::class, 'home'])->name('home');

Route::get('/login', [PageController::class, 'login'])->name('login');
Route::get('/register', [PageController::class, 'register'])->name('register');
Route::get('/verify-otp', [AuthController::class, 'showVerifyOtp'])->name('verify-otp');

// Auth form submits
Route::post('/login', [AuthController::class, 'loginSubmit'])->name('login.submit');
Route::post('/register', [AuthController::class, 'registerSubmit'])->name('register.submit');
Route::post('/verify-otp', [AuthController::class, 'verifyOtpSubmit'])->name('verify-otp.submit');
Route::post('/logout', [AuthController::class, 'logoutSession'])->name('logout');

// Product detail (public Blade view)
Route::get('/products/{id}', [PageController::class, 'showProduct'])->name('products.show');

// Browse products page (public)
Route::get('/browse', [PageController::class, 'browse'])->name('browse');

// ── Authenticated User Routes ─────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/create-listing', [PageController::class, 'createListing'])->name('create-listing');
    Route::post('/create-listing', [PageController::class, 'storeListing'])->name('products.store');
    Route::get('/my-listings', [PageController::class, 'myListings'])->name('my-listings');
    Route::get('/saved-items', [PageController::class, 'savedItems'])->name('saved-items');
    Route::get('/messages', [PageController::class, 'messages'])->name('messages');
    Route::get('/my-profile', [PageController::class, 'profile'])->name('profile');
    Route::put('/my-profile', [ProfileController::class, 'updateProfile'])->name('profile.update');
    Route::post('/my-profile/avatar', [ProfileController::class, 'uploadAvatarSession'])->name('profile.avatar');

    // Product management (session auth)
    Route::delete('/products/{id}', [ProductController::class, 'destroySession'])->name('products.destroy');
    Route::patch('/products/{id}/sold', [ProductController::class, 'markSoldSession'])->name('products.sold');
    Route::patch('/products/{id}/available', [ProductController::class, 'markAvailableSession'])->name('products.available');

    // Favourites (session)
    Route::post('/favourites/{id}', [FavouriteController::class, 'toggleSession'])->name('favourites.toggle');

    // Reports (session)
    Route::post('/products/{id}/report', [ReportController::class, 'storeSession'])->name('report.store');
});

// ── Admin Panel Routes ────────────────────────────────────────────
Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/products', [AdminController::class, 'productsIndex'])->name('products.index');
    Route::get('/sold-products', [AdminController::class, 'soldProducts'])->name('products.sold');
    Route::get('/users', [AdminController::class, 'usersIndex'])->name('users.index');
    Route::get('/users/{id}', [AdminController::class, 'userShow'])->name('users.show');
    Route::get('/products/{id}', [AdminController::class, 'productShow'])->name('products.show');
    Route::get('/reports', [AdminController::class, 'reportsIndex'])->name('reports.index');
    Route::patch('/reports/{id}/dismiss', [AdminController::class, 'dismissReport'])->name('reports.dismiss');
    Route::patch('/products/{id}/dismiss-reports', [AdminController::class, 'dismissAllReports'])->name('reports.dismiss-all');
    Route::delete('/products/{id}', [AdminController::class, 'deleteProductSoft'])->name('products.destroy');
    Route::patch('/products/{id}/mark-sold', [AdminController::class, 'markSold'])->name('products.mark-sold');
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');
});

// ── API JSON Routes (Sanctum) ─────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])->name('api.verify-otp');
Route::post('/auth/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp'])->name('api.resend-otp');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('api.forgot-password');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('api.reset-password');
Route::get('/api/categories', [CategoryController::class, 'index'])->name('api.categories');
Route::get('/api/products', [ProductController::class, 'index'])->name('api.products');
Route::get('/api/products/{id}', [ProductController::class, 'show'])->name('api.products.show');
