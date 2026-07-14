<?php

use App\Http\Controllers\{AuthController, PageController, AdminController};
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

// ── Shared auth plumbing (kept: the Admin Panel logs in through these) ──
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/login', [PageController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'loginSubmit'])->name('login.submit');
Route::post('/logout', [AuthController::class, 'logoutSession'])->name('logout');

// ── Admin Panel Routes ────────────────────────────────────────────
Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/products', [AdminController::class, 'productsIndex'])->name('products.index');
    Route::get('/sold-products', [AdminController::class, 'soldProducts'])->name('products.sold');
    Route::get('/users', [AdminController::class, 'usersIndex'])->name('users.index');
    Route::get('/users/{id}', [AdminController::class, 'userShow'])->name('users.show');
    Route::patch('/users/{id}/toggle-block', [AdminController::class, 'toggleBlockUser'])->name('users.toggle-block');
    Route::get('/products/{id}', [AdminController::class, 'productShow'])->name('products.show');
    Route::get('/reports', [AdminController::class, 'reportsIndex'])->name('reports.index');
    Route::patch('/reports/{id}/dismiss', [AdminController::class, 'dismissReport'])->name('reports.dismiss');
    Route::patch('/products/{id}/dismiss-reports', [AdminController::class, 'dismissAllReports'])->name('reports.dismiss-all');
    Route::delete('/products/{id}', [AdminController::class, 'deleteProductSoft'])->name('products.destroy');
    Route::patch('/products/{id}/mark-sold', [AdminController::class, 'markSold'])->name('products.mark-sold');
    Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');
    Route::post('/settings/password', [AdminController::class, 'updatePassword'])->name('settings.password');
    Route::post('/settings/admins', [AdminController::class, 'storeAdmin'])->name('settings.admins.store');
});
