<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\SupplyController;
use App\Http\Controllers\SupplyHistoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Models\Supply;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// protected/authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // user api routes
    Route::post('/add-user', [UserController::class, 'addUser']);
    Route::put('/update-user/{id}', [UserController::class, 'updateUser']);
    Route::get('/users', [UserController::class, 'index']);

    // item api routes
    Route::post('/create-item', [SupplyController::class, 'createItem']);
    Route::put('/update-item/{id}', [SupplyController::class, 'updateItem']);
    Route::get('/items', [SupplyController::class, 'index']);
    Route::get('/items-name', [SupplyController::class, 'getName']);

    // history api routes
    Route::get('/supply-histories', [SupplyHistoryController::class, 'index']);


    // report api routes
    Route::get('/lowstock-report', [SupplyController::class, 'lowstockReport']);
    Route::get('/stock-movemnt-report', [SupplyController::class, 'stockMovementReport']);
});


// auth api routes
Route::post("/login", [AuthController::class, 'login']);

// Route::get('/auth/google', [GoogleController::class, 'googleLogin'])->name('auth.google');
// Route::get('/api/callback','googleCallback')->name('auth.google-callback');
