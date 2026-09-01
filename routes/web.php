<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PetController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// Inventory Management & Stock Adjustment
Route::resource('inventory', InventoryController::class)->except(['create', 'show', 'edit']);
Route::post('inventory/{item}/adjust-stock', [InventoryController::class, 'adjustStock'])->name('inventory.adjust-stock');
Route::get('inventory/{item}/stock-history', [InventoryController::class, 'stockHistory'])->name('inventory.stock-history');

// Customer & Pet Management (with Full Editable History)
Route::resource('customers', CustomerController::class);
Route::resource('pets', PetController::class)->only(['store', 'update', 'destroy']);

// Invoices, Billing, & Automatic Inventory Reduction
Route::resource('invoices', InvoiceController::class);
Route::get('api/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.api.show');

// Database diagnostic & migration triggers
Route::get('debug-db', function () {
    try {
        \DB::connection()->getPdo();
        $tables = \DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        return response()->json([
            'status' => 'connected',
            'driver' => \DB::connection()->getDriverName(),
            'database' => \DB::connection()->getDatabaseName(),
            'tables' => $tables,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});

Route::get('run-migrate', function () {
    try {
        \Artisan::call('migrate', ['--force' => true, '--seed' => true]);
        return response()->json([
            'status' => 'success',
            'output' => \Artisan::output(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});
