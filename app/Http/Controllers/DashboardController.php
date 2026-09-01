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

        // 1. Fetch Invoices for stats and chart in 1 single fast query
        $invoices = Invoice::where('created_at', '>=', $thisMonth)
            ->where('payment_status', '!=', 'refunded')
            ->get(['created_at', 'paid_amount', 'payment_status']);

        $todayRevenue = $invoices->filter(fn($i) => $i->created_at >= $today)->sum('paid_amount');
        $monthRevenue = $invoices->sum('paid_amount');

        // Customer, Pet, & Invoice counts
        $totalInvoicesCount = Invoice::count();
        $pendingPaymentsCount = Invoice::where('payment_status', 'pending')->count();
        $totalCustomers = Customer::count();
        $totalPets = Pet::count();

        // Low stock items
        $lowStockItems = InventoryItem::with('category')
            ->where('is_service', false)
            ->where('is_active', true)
            ->whereColumn('stock_quantity', '<=', 'reorder_level')
            ->orderBy('stock_quantity', 'asc')
            ->get();

        $totalInventoryCount = InventoryItem::where('is_service', false)->where('is_active', true)->count();
        $outOfStockCount = $lowStockItems->where('stock_quantity', '<=', 0)->count();

        // Recent Invoices (6 items)
        $recentInvoices = Invoice::with(['customer', 'pet', 'items'])
            ->latest()
            ->take(6)
            ->get();

        // Compute 7-day revenue chart in memory (0 extra network roundtrips)
        $revenueLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayRevenue = $invoices
                ->filter(fn($inv) => $inv->created_at->isSameDay($date))
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
