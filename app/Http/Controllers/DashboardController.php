<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Pet;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Financial KPIs
        $todayRevenue = Invoice::whereDate('created_at', $today)
            ->where('payment_status', '!=', 'refunded')
            ->sum('paid_amount');

        $monthRevenue = Invoice::where('created_at', '>=', $thisMonth)
            ->where('payment_status', '!=', 'refunded')
            ->sum('paid_amount');

        $totalInvoicesCount = Invoice::count();
        $pendingPaymentsCount = Invoice::where('payment_status', 'pending')->count();

        // Customer & Pet Counts
        $totalCustomers = Customer::count();
        $totalPets = Pet::count();

        // Low stock items (physical items where stock <= reorder_level)
        $lowStockItems = InventoryItem::with('category')
            ->where('is_service', false)
            ->where('is_active', true)
            ->whereColumn('stock_quantity', '<=', 'reorder_level')
            ->orderBy('stock_quantity', 'asc')
            ->get();

        $totalInventoryCount = InventoryItem::where('is_service', false)->where('is_active', true)->count();
        $outOfStockCount = InventoryItem::where('is_service', false)->where('is_active', true)->where('stock_quantity', '<=', 0)->count();

        // Recent Invoices / Transactions
        $recentInvoices = Invoice::with(['customer', 'pet', 'items'])
            ->latest()
            ->take(6)
            ->get();

        // 7-day revenue chart data
        $revenueLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayRevenue = Invoice::whereDate('created_at', $date)
                ->where('payment_status', '!=', 'refunded')
                ->sum('paid_amount');

            $revenueLast7Days[] = [
                'date' => $date->format('M d'),
                'day' => $date->format('D'),
                'revenue' => (float) $dayRevenue,
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'todayRevenue' => (float) $todayRevenue,
                'monthRevenue' => (float) $monthRevenue,
                'totalInvoicesCount' => $totalInvoicesCount,
                'pendingPaymentsCount' => $pendingPaymentsCount,
                'totalCustomers' => $totalCustomers,
                'totalPets' => $totalPets,
                'lowStockCount' => $lowStockItems->count(),
                'outOfStockCount' => $outOfStockCount,
                'totalInventoryCount' => $totalInventoryCount,
            ],
            'lowStockItems' => $lowStockItems,
            'recentInvoices' => $recentInvoices,
            'revenueChart' => $revenueLast7Days,
        ]);
    }
}
