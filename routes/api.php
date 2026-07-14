<?php

use App\Http\Controllers\{
    AuthController, ProfileController, ProductController, CategoryController,
    FavouriteController, ConversationController, ReportController, ReviewController,
    StatsController
};
use Illuminate\Support\Facades\Route;

// ── Public JSON Auth ───────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:8,1')->name('api.login');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1')->name('api.verify-otp');
Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:5,1')->name('api.resend-otp');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1')->name('api.forgot-password');
Route::post('/auth/verify-reset-otp', [AuthController::class, 'verifyResetOtp'])->middleware('throttle:10,1')->name('api.verify-reset-otp');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('api.reset-password');

// ── Public catalogue browsing ───────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index'])->name('api.categories');
Route::get('/stats', [StatsController::class, 'index'])->name('api.stats');
Route::get('/products', [ProductController::class, 'index'])->name('api.products');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('api.products.show');

// ── Public reviews read ──────────────────────────────────────────────
Route::get('/users/{id}/reviews', [ReviewController::class, 'index'])->name('api.users.reviews');

// ── Authenticated (Sanctum bearer token) ────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.logout');
    Route::get('/auth/user', [ProfileController::class, 'show'])->name('api.user');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}/sold', [ProductController::class, 'markSold']);
    Route::patch('/products/{id}/available', [ProductController::class, 'markAvailable']);

    Route::get('/favourites', [FavouriteController::class, 'index']);
    Route::post('/favourites/{id}', [FavouriteController::class, 'add']);
    Route::delete('/favourites/{id}', [FavouriteController::class, 'remove']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{id}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage']);

    Route::post('/products/{id}/report', [ReportController::class, 'store']);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
});
