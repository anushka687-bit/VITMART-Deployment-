<?php

use App\Http\Controllers\{
    ProfileController, ProductController, FavouriteController,
    ConversationController, ReportController
};
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::patch('/products/{id}/sold', [ProductController::class, 'markSold']);

    Route::get('/favourites', [FavouriteController::class, 'index']);
    Route::post('/favourites/{id}', [FavouriteController::class, 'add']);
    Route::delete('/favourites/{id}', [FavouriteController::class, 'remove']);

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{id}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage']);

    Route::post('/products/{id}/report', [ReportController::class, 'store']);
});
