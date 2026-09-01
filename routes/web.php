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
