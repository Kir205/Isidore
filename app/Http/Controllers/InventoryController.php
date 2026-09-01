<?php

namespace App\Http\Controllers;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $filterStock = $request->input('filter_stock'); // all, low, out, service, product

        $items = InventoryItem::query()
            ->with(['category'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($filterStock === 'low', function ($query) {
                $query->where('is_service', false)
                    ->whereColumn('stock_quantity', '<=', 'reorder_level');
            })
            ->when($filterStock === 'out', function ($query) {
                $query->where('is_service', false)
                    ->where('stock_quantity', '<=', 0);
            })
            ->when($filterStock === 'service', function ($query) {
                $query->where('is_service', true);
            })
            ->when($filterStock === 'product', function ($query) {
                $query->where('is_service', false);
            })
            ->orderBy('is_service', 'asc')
            ->orderBy('name', 'asc')
            ->paginate(20)
            ->withQueryString();

        $categories = InventoryCategory::withCount('items')->get();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'filter_stock' => $filterStock ?? 'all',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:inventory_categories,id',
            'sku' => 'required|string|max:50|unique:inventory_items,sku',
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'is_service' => 'required|boolean',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated) {
            $item = InventoryItem::create($validated);

            if (!$item->is_service && $item->stock_quantity > 0) {
                StockMovement::create([
                    'inventory_item_id' => $item->id,
                    'invoice_id' => null,
                    'type' => 'restock',
                    'quantity_change' => $item->stock_quantity,
                    'previous_stock' => 0,
                    'new_stock' => $item->stock_quantity,
                    'reference_note' => 'Initial stock on item creation',
                ]);
            }
        });

        return redirect()->back()->with('success', "Item \"{$request->name}\" added to catalog!");
    }

    public function update(Request $request, InventoryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:inventory_categories,id',
            'sku' => 'required|string|max:50|unique:inventory_items,sku,' . $item->id,
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'reorder_level' => 'required|integer|min:0',
            'is_service' => 'required|boolean',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'is_active' => 'required|boolean',
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', "Item \"{$item->name}\" updated successfully!");
    }

    public function adjustStock(Request $request, InventoryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'adjustment_type' => 'required|in:restock,adjustment_add,adjustment_remove,damage,expired',
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        if ($item->is_service) {
            return redirect()->back()->with('error', 'Clinical services do not carry inventory stock.');
        }

        DB::transaction(function () use ($item, $validated) {
            $prevStock = $item->stock_quantity;
            $qty = $validated['quantity'];
            $type = $validated['adjustment_type'];

            $isAddition = in_array($type, ['restock', 'adjustment_add']);
            $change = $isAddition ? $qty : -$qty;
            $newStock = max(0, $prevStock + $change);

            $item->update(['stock_quantity' => $newStock]);

            StockMovement::create([
                'inventory_item_id' => $item->id,
                'invoice_id' => null,
                'type' => $type,
                'quantity_change' => $change,
                'previous_stock' => $prevStock,
                'new_stock' => $newStock,
                'reference_note' => $validated['note'] ?: ucfirst(str_replace('_', ' ', $type)),
            ]);
        });

        return redirect()->back()->with('success', "Stock for \"{$item->name}\" updated successfully!");
    }

    public function stockHistory(InventoryItem $item)
    {
        $movements = $item->stockMovements()
            ->with('invoice.customer')
            ->latest()
            ->take(50)
            ->get();

        return response()->json([
            'item' => $item,
            'movements' => $movements,
        ]);
    }

    public function destroy(InventoryItem $item): RedirectResponse
    {
        $name = $item->name;
        $item->delete();

        return redirect()->back()->with('success', "Item \"{$name}\" removed from inventory.");
    }
}
