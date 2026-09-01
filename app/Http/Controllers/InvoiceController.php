<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Pet;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $method = $request->input('method');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $invoices = Invoice::query()
            ->with(['customer', 'pet', 'items.inventoryItem'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        })
                        ->orWhereHas('pet', function ($pq) use ($search) {
                            $pq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('payment_status', $status);
            })
            ->when($method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->when($dateFrom, function ($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'method' => $method,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $customerId = $request->input('customer_id');
        $petId = $request->input('pet_id');

        $customers = Customer::with('pets')->orderBy('name')->get();
        $categories = InventoryCategory::with(['items' => function ($q) {
            $q->where('is_active', true)->orderBy('name');
        }])->get();

        $allItems = InventoryItem::where('is_active', true)
            ->with('category')
            ->orderBy('name')
            ->get();

        // Next invoice number preview
        $latestId = Invoice::max('id') ?? 0;
        $nextInvoiceNumber = 'INV-' . date('Y') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Invoices/Create', [
            'customers' => $customers,
            'categories' => $categories,
            'allItems' => $allItems,
            'nextInvoiceNumber' => $nextInvoiceNumber,
            'initialCustomerId' => $customerId ? (int)$customerId : null,
            'initialPetId' => $petId ? (int)$petId : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'pet_id' => 'nullable|exists:pets,id',
            'visit_reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'diagnosis_treatment' => 'nullable|string',
            'discount_type' => 'required|in:fixed,percentage',
            'discount_value' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'payment_status' => 'required|in:paid,partial,pending',
            'payment_method' => 'required|in:cash,credit_card,debit_card,gcash,bank_transfer,insurance,other',
            'paid_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.instructions' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // Generate official invoice number
            $latestId = Invoice::max('id') ?? 0;
            $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);

            // Compute subtotal from items
            $subtotal = 0;
            foreach ($validated['items'] as $itemData) {
                $subtotal += ($itemData['unit_price'] * $itemData['quantity']);
            }

            // Compute discount
            $discountValue = (float) $validated['discount_value'];
            if ($validated['discount_type'] === 'percentage') {
                $discountAmount = ($subtotal * ($discountValue / 100));
            } else {
                $discountAmount = min($subtotal, $discountValue);
            }

            // Compute tax
            $taxRate = (float) ($validated['tax_rate'] ?? 0);
            $taxableBase = max(0, $subtotal - $discountAmount);
            $taxAmount = $taxableBase * ($taxRate / 100);

            $totalAmount = max(0, $taxableBase + $taxAmount);
            $paidAmount = (float) $validated['paid_amount'];
            $changeAmount = max(0, $paidAmount - $totalAmount);

            // Determine status
            $paymentStatus = $validated['payment_status'];
            if ($paidAmount >= $totalAmount && $totalAmount > 0) {
                $paymentStatus = 'paid';
            } elseif ($paidAmount > 0 && $paidAmount < $totalAmount) {
                $paymentStatus = 'partial';
            }

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $validated['customer_id'],
                'pet_id' => $validated['pet_id'] ?? null,
                'subtotal' => $subtotal,
                'discount_type' => $validated['discount_type'],
                'discount_value' => $discountValue,
                'discount_amount' => $discountAmount,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'payment_status' => $paymentStatus,
                'payment_method' => $validated['payment_method'],
                'visit_reason' => $validated['visit_reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'diagnosis_treatment' => $validated['diagnosis_treatment'] ?? null,
            ]);

            // Save items and AUTOMATICALLY DEDUCT INVENTORY
            foreach ($validated['items'] as $itemData) {
                $itemSubtotal = $itemData['unit_price'] * $itemData['quantity'];

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'inventory_item_id' => $itemData['inventory_item_id'] ?? null,
                    'item_name' => $itemData['item_name'],
                    'unit_price' => $itemData['unit_price'],
                    'quantity' => $itemData['quantity'],
                    'subtotal' => $itemSubtotal,
                    'instructions' => $itemData['instructions'] ?? null,
                ]);

                // Automatically reduce inventory quantity if linked to physical item
                if (!empty($itemData['inventory_item_id'])) {
                    $invItem = InventoryItem::find($itemData['inventory_item_id']);
                    if ($invItem && !$invItem->is_service) {
                        $prevStock = $invItem->stock_quantity;
                        $qty = (int) $itemData['quantity'];
                        $newStock = max(0, $prevStock - $qty);

                        $invItem->update(['stock_quantity' => $newStock]);

                        StockMovement::create([
                            'inventory_item_id' => $invItem->id,
                            'invoice_id' => $invoice->id,
                            'type' => 'sale',
                            'quantity_change' => -$qty,
                            'previous_stock' => $prevStock,
                            'new_stock' => $newStock,
                            'reference_note' => "Sold on Invoice #{$invoice->invoice_number}",
                        ]);
                    }
                }
            }

            return redirect()->route('invoices.index')->with('success', "Invoice {$invoice->invoice_number} recorded & inventory updated automatically!");
        });
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer.pets', 'pet', 'items.inventoryItem.category']);
        return response()->json($invoice);
    }

    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'visit_reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'diagnosis_treatment' => 'nullable|string',
            'payment_status' => 'required|in:paid,partial,pending,refunded',
            'payment_method' => 'required|in:cash,credit_card,debit_card,gcash,bank_transfer,insurance,other',
            'paid_amount' => 'required|numeric|min:0',
            'discount_type' => 'required|in:fixed,percentage',
            'discount_value' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'items' => 'sometimes|array|min:1',
            'items.*.id' => 'nullable|integer',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.instructions' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $invoice) {
            if (isset($validated['items'])) {
                // Synchronize and adjust inventory for modified line items
                $oldItems = $invoice->items()->get()->keyBy('id');
                $newItemsList = $validated['items'];

                $subtotal = 0;
                $processedOldIds = [];

                foreach ($newItemsList as $nItem) {
                    $itemSubtotal = $nItem['unit_price'] * $nItem['quantity'];
                    $subtotal += $itemSubtotal;

                    $existingId = $nItem['id'] ?? null;
                    if ($existingId && isset($oldItems[$existingId])) {
                        // Existing item was modified
                        $oldItem = $oldItems[$existingId];
                        $processedOldIds[] = $existingId;
                        $oldQty = $oldItem->quantity;
                        $newQty = (int) $nItem['quantity'];
                        $qtyDiff = $newQty - $oldQty; // positive means more taken, negative means returned

                        $oldItem->update([
                            'item_name' => $nItem['item_name'],
                            'unit_price' => $nItem['unit_price'],
                            'quantity' => $newQty,
                            'subtotal' => $itemSubtotal,
                            'instructions' => $nItem['instructions'] ?? null,
                        ]);

                        // Adjust stock differential
                        if ($qtyDiff !== 0 && $oldItem->inventory_item_id) {
                            $invItem = InventoryItem::find($oldItem->inventory_item_id);
                            if ($invItem && !$invItem->is_service) {
                                $prevStock = $invItem->stock_quantity;
                                $newStock = max(0, $prevStock - $qtyDiff);
                                $invItem->update(['stock_quantity' => $newStock]);

                                StockMovement::create([
                                    'inventory_item_id' => $invItem->id,
                                    'invoice_id' => $invoice->id,
                                    'type' => $qtyDiff > 0 ? 'sale' : 'return',
                                    'quantity_change' => -$qtyDiff,
                                    'previous_stock' => $prevStock,
                                    'new_stock' => $newStock,
                                    'reference_note' => "Invoice #{$invoice->invoice_number} quantity adjusted from {$oldQty} to {$newQty}",
                                ]);
                            }
                        }
                    } else {
                        // Brand new item added to invoice
                        $createdItem = InvoiceItem::create([
                            'invoice_id' => $invoice->id,
                            'inventory_item_id' => $nItem['inventory_item_id'] ?? null,
                            'item_name' => $nItem['item_name'],
                            'unit_price' => $nItem['unit_price'],
                            'quantity' => $nItem['quantity'],
                            'subtotal' => $itemSubtotal,
                            'instructions' => $nItem['instructions'] ?? null,
                        ]);

                        if (!empty($nItem['inventory_item_id'])) {
                            $invItem = InventoryItem::find($nItem['inventory_item_id']);
                            if ($invItem && !$invItem->is_service) {
                                $prevStock = $invItem->stock_quantity;
                                $newStock = max(0, $prevStock - (int)$nItem['quantity']);
                                $invItem->update(['stock_quantity' => $newStock]);

                                StockMovement::create([
                                    'inventory_item_id' => $invItem->id,
                                    'invoice_id' => $invoice->id,
                                    'type' => 'sale',
                                    'quantity_change' => -(int)$nItem['quantity'],
                                    'previous_stock' => $prevStock,
                                    'new_stock' => $newStock,
                                    'reference_note' => "Added item to Invoice #{$invoice->invoice_number}",
                                ]);
                            }
                        }
                    }
                }

                // Restore stock for deleted line items
                foreach ($oldItems as $oldId => $oldItem) {
                    if (!in_array($oldId, $processedOldIds)) {
                        if ($oldItem->inventory_item_id) {
                            $invItem = InventoryItem::find($oldItem->inventory_item_id);
                            if ($invItem && !$invItem->is_service) {
                                $prevStock = $invItem->stock_quantity;
                                $newStock = $prevStock + $oldItem->quantity;
                                $invItem->update(['stock_quantity' => $newStock]);

                                StockMovement::create([
                                    'inventory_item_id' => $invItem->id,
                                    'invoice_id' => $invoice->id,
                                    'type' => 'return',
                                    'quantity_change' => $oldItem->quantity,
                                    'previous_stock' => $prevStock,
                                    'new_stock' => $newStock,
                                    'reference_note' => "Removed item from Invoice #{$invoice->invoice_number}",
                                ]);
                            }
                        }
                        $oldItem->delete();
                    }
                }
            } else {
                $subtotal = $invoice->subtotal;
            }

            // Recalculate totals
            $discountValue = (float) $validated['discount_value'];
            if ($validated['discount_type'] === 'percentage') {
                $discountAmount = ($subtotal * ($discountValue / 100));
            } else {
                $discountAmount = min($subtotal, $discountValue);
            }

            $taxRate = (float) ($validated['tax_rate'] ?? 0);
            $taxableBase = max(0, $subtotal - $discountAmount);
            $taxAmount = $taxableBase * ($taxRate / 100);
            $totalAmount = max(0, $taxableBase + $taxAmount);
            $paidAmount = (float) $validated['paid_amount'];
            $changeAmount = max(0, $paidAmount - $totalAmount);

            $invoice->update([
                'subtotal' => $subtotal,
                'discount_type' => $validated['discount_type'],
                'discount_value' => $discountValue,
                'discount_amount' => $discountAmount,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'payment_status' => $validated['payment_status'],
                'payment_method' => $validated['payment_method'],
                'visit_reason' => $validated['visit_reason'] ?? $invoice->visit_reason,
                'notes' => $validated['notes'] ?? $invoice->notes,
                'diagnosis_treatment' => $validated['diagnosis_treatment'] ?? $invoice->diagnosis_treatment,
            ]);

            return redirect()->back()->with('success', "Invoice {$invoice->invoice_number} and customer history updated successfully!");
        });
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        DB::transaction(function () use ($invoice) {
            // Restore inventory for all items
            foreach ($invoice->items as $item) {
                if ($item->inventory_item_id) {
                    $invItem = InventoryItem::find($item->inventory_item_id);
                    if ($invItem && !$invItem->is_service) {
                        $prevStock = $invItem->stock_quantity;
                        $newStock = $prevStock + $item->quantity;
                        $invItem->update(['stock_quantity' => $newStock]);

                        StockMovement::create([
                            'inventory_item_id' => $invItem->id,
                            'invoice_id' => null,
                            'type' => 'return',
                            'quantity_change' => $item->quantity,
                            'previous_stock' => $prevStock,
                            'new_stock' => $newStock,
                            'reference_note' => "Invoice #{$invoice->invoice_number} voided / deleted - stock restored",
                        ]);
                    }
                }
            }

            $num = $invoice->invoice_number;
            $invoice->delete();
        });

        return redirect()->back()->with('success', "Invoice record deleted and inventory stock restored.");
    }
}
