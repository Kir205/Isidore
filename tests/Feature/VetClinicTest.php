<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\Pet;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VetClinicTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_customer_and_pet(): void
    {
        $response = $this->post(route('customers.store'), [
            'name' => 'Alice Walker',
            'phone' => '+1 555-0199',
            'email' => 'alice@example.com',
            'address' => '123 Oak Street',
            'pet_name' => 'Cooper',
            'pet_species' => 'Dog',
            'pet_breed' => 'Labrador',
            'pet_gender' => 'Male',
            'pet_weight_kg' => 28.5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('customers', ['name' => 'Alice Walker']);
        $this->assertDatabaseHas('pets', ['name' => 'Cooper', 'species' => 'Dog']);
    }

    public function test_invoice_creation_automatically_reduces_inventory_quantity(): void
    {
        $category = InventoryCategory::create([
            'name' => 'Antibiotics',
            'slug' => 'antibiotics',
        ]);

        $item = InventoryItem::create([
            'category_id' => $category->id,
            'sku' => 'TEST-AMOX-50',
            'name' => 'Amoxicillin Test 500mg',
            'unit' => 'tablet',
            'cost_price' => 1.00,
            'selling_price' => 2.50,
            'stock_quantity' => 50,
            'reorder_level' => 10,
            'is_service' => false,
        ]);

        $customer = Customer::create([
            'name' => 'John Doe',
            'phone' => '+1 555-1234',
        ]);

        $pet = Pet::create([
            'customer_id' => $customer->id,
            'name' => 'Rocky',
            'species' => 'Dog',
        ]);

        $response = $this->post(route('invoices.store'), [
            'customer_id' => $customer->id,
            'pet_id' => $pet->id,
            'visit_reason' => 'Bacterial Infection',
            'diagnosis_treatment' => 'Administered antibiotic regimen',
            'discount_type' => 'fixed',
            'discount_value' => 0,
            'tax_rate' => 0,
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 25.00,
            'items' => [
                [
                    'inventory_item_id' => $item->id,
                    'item_name' => 'Amoxicillin Test 500mg',
                    'unit_price' => 2.50,
                    'quantity' => 10,
                    'instructions' => '1 tablet every 12 hours',
                ]
            ]
        ]);

        $response->assertRedirect(route('invoices.index'));

        // Verify that stock quantity was reduced from 50 to 40
        $item->refresh();
        $this->assertEquals(40, $item->stock_quantity);

        // Verify stock movement was recorded
        $this->assertDatabaseHas('stock_movements', [
            'inventory_item_id' => $item->id,
            'type' => 'sale',
            'quantity_change' => -10,
            'previous_stock' => 50,
            'new_stock' => 40,
        ]);

        // Verify invoice and invoice items
        $this->assertDatabaseHas('invoices', [
            'customer_id' => $customer->id,
            'total_amount' => 25.00,
            'payment_status' => 'paid',
        ]);
    }

    public function test_deleting_invoice_restores_inventory_stock(): void
    {
        $item = InventoryItem::create([
            'sku' => 'TEST-VACC-01',
            'name' => 'Test Vaccine',
            'unit' => 'vial',
            'cost_price' => 5.00,
            'selling_price' => 20.00,
            'stock_quantity' => 30,
            'reorder_level' => 5,
            'is_service' => false,
        ]);

        $customer = Customer::create([
            'name' => 'Jane Smith',
            'phone' => '+1 555-9876',
        ]);

        // Create invoice for 5 vials
        $this->post(route('invoices.store'), [
            'customer_id' => $customer->id,
            'discount_type' => 'fixed',
            'discount_value' => 0,
            'tax_rate' => 0,
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 100.00,
            'items' => [
                [
                    'inventory_item_id' => $item->id,
                    'item_name' => 'Test Vaccine',
                    'unit_price' => 20.00,
                    'quantity' => 5,
                ]
            ]
        ]);

        $item->refresh();
        $this->assertEquals(25, $item->stock_quantity);

        $invoice = Invoice::first();

        // Delete invoice
        $response = $this->delete(route('invoices.destroy', $invoice->id));
        $response->assertRedirect();

        // Verify stock is restored from 25 back to 30
        $item->refresh();
        $this->assertEquals(30, $item->stock_quantity);

        // Verify return movement logged
        $this->assertDatabaseHas('stock_movements', [
            'inventory_item_id' => $item->id,
            'type' => 'return',
            'quantity_change' => 5,
            'new_stock' => 30,
        ]);
    }

    public function test_clinical_services_do_not_deduct_inventory_stock(): void
    {
        $service = InventoryItem::create([
            'sku' => 'SRV-TEST-01',
            'name' => 'General Exam Service',
            'unit' => 'session',
            'cost_price' => 0,
            'selling_price' => 35.00,
            'stock_quantity' => 9999,
            'reorder_level' => 0,
            'is_service' => true,
        ]);

        $customer = Customer::create([
            'name' => 'Mark Evans',
            'phone' => '+1 555-4444',
        ]);

        $this->post(route('invoices.store'), [
            'customer_id' => $customer->id,
            'discount_type' => 'fixed',
            'discount_value' => 0,
            'tax_rate' => 0,
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount' => 35.00,
            'items' => [
                [
                    'inventory_item_id' => $service->id,
                    'item_name' => 'General Exam Service',
                    'unit_price' => 35.00,
                    'quantity' => 1,
                ]
            ]
        ]);

        $service->refresh();
        // Service stock should remain untouched
        $this->assertEquals(9999, $service->stock_quantity);
    }
}
