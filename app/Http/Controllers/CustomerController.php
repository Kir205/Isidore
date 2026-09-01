<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Pet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $customers = Customer::query()
            ->with(['pets'])
            ->withCount(['pets', 'invoices'])
            ->withSum(['invoices' => function ($query) {
                $query->where('payment_status', '!=', 'refunded');
            }], 'total_amount')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('pets', function ($pq) use ($search) {
                            $pq->where('name', 'like', "%{$search}%")
                                ->orWhere('breed', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'pets',
            'invoices' => function ($query) {
                $query->with(['pet', 'items.inventoryItem'])->latest();
            }
        ]);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            // Optional first pet
            'pet_name' => 'nullable|string|max:255',
            'pet_species' => 'nullable|string|max:100',
            'pet_breed' => 'nullable|string|max:100',
            'pet_gender' => 'nullable|string|in:Male,Female,Neutered Male,Spayed Female,Unknown',
            'pet_weight_kg' => 'nullable|numeric|min:0',
            'pet_date_of_birth' => 'nullable|date',
            'pet_medical_notes' => 'nullable|string',
            'pet_allergies' => 'nullable|string',
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'emergency_contact' => $validated['emergency_contact'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        if (!empty($validated['pet_name'])) {
            Pet::create([
                'customer_id' => $customer->id,
                'name' => $validated['pet_name'],
                'species' => $validated['pet_species'] ?? 'Dog',
                'breed' => $validated['pet_breed'] ?? null,
                'gender' => $validated['pet_gender'] ?? 'Male',
                'weight_kg' => $validated['pet_weight_kg'] ?? null,
                'date_of_birth' => $validated['pet_date_of_birth'] ?? null,
                'medical_notes' => $validated['pet_medical_notes'] ?? null,
                'allergies' => $validated['pet_allergies'] ?? null,
            ]);
        }

        return redirect()->back()->with('success', "Customer \"{$customer->name}\" added successfully!");
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', "Customer \"{$customer->name}\" updated successfully!");
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $name = $customer->name;
        $customer->delete();

        return redirect()->route('customers.index')->with('success', "Customer \"{$name}\" removed successfully.");
    }
}
