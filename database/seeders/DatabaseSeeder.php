<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Pet;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Default Admin/Staff User
        User::updateOrCreate(
            ['email' => 'admin@vetcare.local'],
            [
                'name' => 'Dr. Eleanor Vance (DVM)',
                'password' => bcrypt('password123'),
            ]
        );

        // 2. Create Inventory Categories
        $catAntibiotics = InventoryCategory::create([
            'name' => 'Antibiotics & Anti-Infectives',
            'slug' => 'antibiotics',
            'description' => 'Prescription antibiotics for bacterial infections in pets',
            'color' => 'emerald',
        ]);

        $catVaccines = InventoryCategory::create([
            'name' => 'Vaccines & Biologics',
            'slug' => 'vaccines',
            'description' => 'Core & non-core preventive vaccinations for canines and felines',
            'color' => 'blue',
        ]);

        $catPainRelief = InventoryCategory::create([
            'name' => 'Pain Relief & Anti-Inflammatory',
            'slug' => 'pain-relief',
            'description' => 'NSAIDs and analgesics for pain management and surgery recovery',
            'color' => 'indigo',
        ]);

        $catParasites = InventoryCategory::create([
            'name' => 'Antiparasitics & Dewormers',
            'slug' => 'antiparasitics',
            'description' => 'Flea, tick, heartworm, and intestinal parasite control',
            'color' => 'amber',
        ]);

        $catSupplies = InventoryCategory::create([
            'name' => 'Clinical Supplies & Bandages',
            'slug' => 'supplies',
            'description' => 'Medical consumables, bandages, syringes, and IV lines',
            'color' => 'cyan',
        ]);

        $catFood = InventoryCategory::create([
            'name' => 'Therapeutic Food & Nutrition',
            'slug' => 'nutrition',
            'description' => 'Veterinary prescription diet foods and recovery supplements',
            'color' => 'orange',
        ]);

        $catServices = InventoryCategory::create([
            'name' => 'Clinical & Diagnostic Services',
            'slug' => 'services',
            'description' => 'Veterinary consultations, minor surgeries, lab work, grooming',
            'color' => 'rose',
        ]);

        // 3. Create Inventory Items (Physical items & Services)
        $itemsData = [
            // Antibiotics
            [
                'category_id' => $catAntibiotics->id,
                'sku' => 'MED-AMOX-500',
                'name' => 'Amoxicillin + Clavulanate (Clavamox)',
                'generic_name' => 'Amoxicillin trihydrate / Clavulanate potassium 250mg',
                'description' => 'Broad-spectrum antibacterial for canine/feline skin, soft tissue, and dental infections',
                'unit' => 'tablet',
                'cost_price' => 1.20,
                'selling_price' => 2.80,
                'stock_quantity' => 120,
                'reorder_level' => 30,
                'is_service' => false,
                'batch_number' => 'AMX-2026-99',
                'expiry_date' => '2027-08-30',
            ],
            [
                'category_id' => $catAntibiotics->id,
                'sku' => 'MED-CEPH-300',
                'name' => 'Cephalexin 300mg Capsules',
                'generic_name' => 'Cephalexin monohydrate',
                'description' => 'Oral antibiotic for pyoderma and urinary tract infections',
                'unit' => 'capsule',
                'cost_price' => 0.85,
                'selling_price' => 2.10,
                'stock_quantity' => 85,
                'reorder_level' => 25,
                'is_service' => false,
                'batch_number' => 'CPH-2026-12',
                'expiry_date' => '2027-11-15',
            ],
            [
                'category_id' => $catAntibiotics->id,
                'sku' => 'MED-METRO-250',
                'name' => 'Metronidazole 250mg',
                'generic_name' => 'Metronidazole',
                'description' => 'Treatment for giardia and acute gastrointestinal inflammation',
                'unit' => 'tablet',
                'cost_price' => 0.60,
                'selling_price' => 1.75,
                'stock_quantity' => 6, // LOW STOCK FOR TESTING ALERT!
                'reorder_level' => 20,
                'is_service' => false,
                'batch_number' => 'MTZ-2026-03',
                'expiry_date' => '2027-04-20',
            ],

            // Vaccines
            [
                'category_id' => $catVaccines->id,
                'sku' => 'VAC-DHPP-01',
                'name' => 'Canine 5-in-1 DHPP Vaccine (Nobivac)',
                'generic_name' => 'Distemper, Hepatitis, Parvovirus, Parainfluenza',
                'description' => 'Core protective vaccine for dogs 6 weeks and older',
                'unit' => 'vial',
                'cost_price' => 9.50,
                'selling_price' => 25.00,
                'stock_quantity' => 45,
                'reorder_level' => 15,
                'is_service' => false,
                'batch_number' => 'NBV-5521',
                'expiry_date' => '2027-03-31',
            ],
            [
                'category_id' => $catVaccines->id,
                'sku' => 'VAC-RAB-01',
                'name' => 'Rabies Vaccine (Defensor 3)',
                'generic_name' => 'Inactivated Rabies Virus',
                'description' => 'Annual rabies vaccination for dogs and cats',
                'unit' => 'vial',
                'cost_price' => 6.00,
                'selling_price' => 18.00,
                'stock_quantity' => 38,
                'reorder_level' => 15,
                'is_service' => false,
                'batch_number' => 'RAB-9920',
                'expiry_date' => '2027-06-15',
            ],
            [
                'category_id' => $catVaccines->id,
                'sku' => 'VAC-FVRCP-01',
                'name' => 'Feline 4-in-1 FVRCP Vaccine (Fel-O-Vax)',
                'generic_name' => 'Rhinotracheitis, Calicivirus, Panleukopenia, Chlamydia',
                'description' => 'Core annual immunization for felines',
                'unit' => 'vial',
                'cost_price' => 8.20,
                'selling_price' => 24.00,
                'stock_quantity' => 28,
                'reorder_level' => 10,
                'is_service' => false,
                'batch_number' => 'FLV-4412',
                'expiry_date' => '2027-02-28',
            ],

            // Pain relief
            [
                'category_id' => $catPainRelief->id,
                'sku' => 'MED-MELOX-15',
                'name' => 'Meloxicam 1.5mg/ml Oral Suspension (Metacam 32ml)',
                'generic_name' => 'Meloxicam oral drops',
                'description' => 'Anti-inflammatory and analgesia for canine arthritis and soft tissue injury',
                'unit' => 'bottle',
                'cost_price' => 16.00,
                'selling_price' => 38.00,
                'stock_quantity' => 14,
                'reorder_level' => 5,
                'is_service' => false,
                'batch_number' => 'MTC-8802',
                'expiry_date' => '2027-09-30',
            ],
            [
                'category_id' => $catPainRelief->id,
                'sku' => 'MED-CARP-75',
                'name' => 'Carprofen 75mg Chewable Tablets (Rimadyl)',
                'generic_name' => 'Carprofen chewable',
                'description' => 'Flavored chewables for osteoarthritis relief in dogs',
                'unit' => 'tablet',
                'cost_price' => 1.40,
                'selling_price' => 3.50,
                'stock_quantity' => 4, // LOW STOCK ALERT
                'reorder_level' => 15,
                'is_service' => false,
                'batch_number' => 'RMD-7711',
                'expiry_date' => '2027-05-18',
            ],

            // Antiparasitics
            [
                'category_id' => $catParasites->id,
                'sku' => 'PAR-NEXG-MED',
                'name' => 'NexGard Chewable (10.1 - 24 kg)',
                'generic_name' => 'Afoxolaner 68mg',
                'description' => 'Monthly beef-flavored chew against fleas and ticks for medium dogs',
                'unit' => 'piece',
                'cost_price' => 12.00,
                'selling_price' => 22.50,
                'stock_quantity' => 32,
                'reorder_level' => 10,
                'is_service' => false,
                'batch_number' => 'NXG-4401',
                'expiry_date' => '2027-12-31',
            ],
            [
                'category_id' => $catParasites->id,
                'sku' => 'PAR-BRAV-CAT',
                'name' => 'Bravecto Spot-On for Cats (2.8 - 6.25 kg)',
                'generic_name' => 'Fluralaner topical',
                'description' => '12-week flea and tick protection pipette for cats',
                'unit' => 'piece',
                'cost_price' => 24.00,
                'selling_price' => 46.00,
                'stock_quantity' => 19,
                'reorder_level' => 8,
                'is_service' => false,
                'batch_number' => 'BRV-1193',
                'expiry_date' => '2028-01-31',
            ],

            // Clinical Supplies
            [
                'category_id' => $catSupplies->id,
                'sku' => 'SUP-SYR-3ML',
                'name' => 'Sterile Syringe 3ml with 23G Needle (Box of 100)',
                'generic_name' => 'Hypodermic Syringe & Needle',
                'description' => 'Single-use veterinary injection syringe',
                'unit' => 'box',
                'cost_price' => 8.50,
                'selling_price' => 16.00,
                'stock_quantity' => 22,
                'reorder_level' => 10,
                'is_service' => false,
                'batch_number' => 'SYR-3301',
                'expiry_date' => '2029-12-31',
            ],
            [
                'category_id' => $catSupplies->id,
                'sku' => 'SUP-BAND-COH',
                'name' => 'Self-Adherent Cohesive Bandage Wrap 2"',
                'generic_name' => 'Elastic Vet Flex Wrap',
                'description' => 'Breathable elastic wrap for paws and dressing protection',
                'unit' => 'piece',
                'cost_price' => 1.10,
                'selling_price' => 3.50,
                'stock_quantity' => 50,
                'reorder_level' => 15,
                'is_service' => false,
                'batch_number' => 'BND-2200',
                'expiry_date' => null,
            ],

            // Food & Nutrition
            [
                'category_id' => $catFood->id,
                'sku' => 'FOOD-RC-GI-2KG',
                'name' => 'Royal Canin Veterinary Gastrointestinal (2kg)',
                'generic_name' => 'Canine Dietetic Digestive Care',
                'description' => 'High energy dry food for canine acute intestinal disorders',
                'unit' => 'bag',
                'cost_price' => 22.00,
                'selling_price' => 39.50,
                'stock_quantity' => 15,
                'reorder_level' => 6,
                'is_service' => false,
                'batch_number' => 'RCG-9901',
                'expiry_date' => '2027-02-15',
            ],
            [
                'category_id' => $catFood->id,
                'sku' => 'FOOD-HILLS-UR-15',
                'name' => "Hill's Prescription Diet c/d Multicare Feline (1.5kg)",
                'generic_name' => 'Feline Urinary Care Diet',
                'description' => 'Clinical nutrition for dissolution of struvite stones in cats',
                'unit' => 'bag',
                'cost_price' => 20.00,
                'selling_price' => 36.00,
                'stock_quantity' => 11,
                'reorder_level' => 5,
                'is_service' => false,
                'batch_number' => 'HLL-7811',
                'expiry_date' => '2027-01-20',
            ],

            // Clinical Services (is_service = true, stock untracked)
            [
                'category_id' => $catServices->id,
                'sku' => 'SRV-CONS-GEN',
                'name' => 'General Veterinary Consultation & Physical Exam',
                'generic_name' => 'Clinical Assessment',
                'description' => 'Full physical examination, vitals check, weight and clinical assessment',
                'unit' => 'session',
                'cost_price' => 0.00,
                'selling_price' => 35.00,
                'stock_quantity' => 9999,
                'reorder_level' => 0,
                'is_service' => true,
                'batch_number' => null,
                'expiry_date' => null,
            ],
            [
                'category_id' => $catServices->id,
                'sku' => 'SRV-VAC-ADMIN',
                'name' => 'Vaccine Administration & Wellness Card Update',
                'generic_name' => 'Immunization Procedure',
                'description' => 'Professional administration and medical card endorsement',
                'unit' => 'session',
                'cost_price' => 0.00,
                'selling_price' => 10.00,
                'stock_quantity' => 9999,
                'reorder_level' => 0,
                'is_service' => true,
                'batch_number' => null,
                'expiry_date' => null,
            ],
            [
                'category_id' => $catServices->id,
                'sku' => 'SRV-CBC-BLOOD',
                'name' => 'Complete Blood Count (CBC) & In-House Chemistry',
                'generic_name' => 'Diagnostic Blood Panel',
                'description' => 'Automated haematology analysis with same-day laboratory results',
                'unit' => 'procedure',
                'cost_price' => 15.00,
                'selling_price' => 45.00,
                'stock_quantity' => 9999,
                'reorder_level' => 0,
                'is_service' => true,
                'batch_number' => null,
                'expiry_date' => null,
            ],
            [
                'category_id' => $catServices->id,
                'sku' => 'SRV-GROOM-FULL',
                'name' => 'Full Medicated Grooming & Nail Trim (Medium Dog)',
                'generic_name' => 'Veterinary Hygiene & Grooming',
                'description' => 'Medicated chlorhexidine bath, ear flushing, anal gland expression, sanitary cut',
                'unit' => 'session',
                'cost_price' => 5.00,
                'selling_price' => 40.00,
                'stock_quantity' => 9999,
                'reorder_level' => 0,
                'is_service' => true,
                'batch_number' => null,
                'expiry_date' => null,
            ],
            [
                'category_id' => $catServices->id,
                'sku' => 'SRV-DENTAL-SCL',
                'name' => 'Ultrasonic Dental Scaling & Polishing (Under Sedation)',
                'generic_name' => 'Periodontal Prophylaxis',
                'description' => 'Calculus removal, subgingival curettage, and fluoride enamel polish',
                'unit' => 'procedure',
                'cost_price' => 30.00,
                'selling_price' => 135.00,
                'stock_quantity' => 9999,
                'reorder_level' => 0,
                'is_service' => true,
                'batch_number' => null,
                'expiry_date' => null,
            ],
        ];

        $createdItems = [];
        foreach ($itemsData as $data) {
            $item = InventoryItem::create($data);
            $createdItems[$item->sku] = $item;

            // Log initial stock movement for physical items
            if (!$item->is_service) {
                StockMovement::create([
                    'inventory_item_id' => $item->id,
                    'invoice_id' => null,
                    'type' => 'restock',
                    'quantity_change' => $item->stock_quantity,
                    'previous_stock' => 0,
                    'new_stock' => $item->stock_quantity,
                    'reference_note' => 'Initial inventory batch setup',
                ]);
            }
        }

        // 4. Create Customers & Pets (Full History)
        $customersData = [
            [
                'name' => 'Sarah Jenkins',
                'phone' => '+1 (555) 234-8901',
                'email' => 'sarah.jenkins@example.com',
                'address' => '742 Evergreen Terrace, Springfield',
                'emergency_contact' => 'Mark Jenkins (+1 555-234-8902)',
                'notes' => 'Prefers morning appointments. Friendly golden retriever owner.',
                'pets' => [
                    [
                        'name' => 'Bailey',
                        'species' => 'Dog',
                        'breed' => 'Golden Retriever',
                        'gender' => 'Male',
                        'date_of_birth' => '2022-04-12',
                        'weight_kg' => 29.5,
                        'microchip_number' => '985141002938491',
                        'medical_notes' => 'Mild seasonal dermatitis in summers. Responds well to Apoquel/Meloxicam.',
                        'allergies' => 'Chicken meal (mild)',
                    ],
                    [
                        'name' => 'Milo',
                        'species' => 'Cat',
                        'breed' => 'Domestic Short Hair',
                        'gender' => 'Neutered Male',
                        'date_of_birth' => '2023-01-10',
                        'weight_kg' => 4.2,
                        'microchip_number' => '985141002938492',
                        'medical_notes' => 'Indoor cat. Healthy teeth.',
                        'allergies' => 'None',
                    ]
                ]
            ],
            [
                'name' => 'Marcus Rodriguez',
                'phone' => '+1 (555) 876-5432',
                'email' => 'm.rodriguez@example.com',
                'address' => '88 Ocean View Blvd, Apt 4B',
                'emergency_contact' => 'Elena Rodriguez (+1 555-876-5433)',
                'notes' => 'Always pays with GCash / E-Wallet.',
                'pets' => [
                    [
                        'name' => 'Luna',
                        'species' => 'Dog',
                        'breed' => 'French Bulldog',
                        'gender' => 'Spayed Female',
                        'date_of_birth' => '2021-09-20',
                        'weight_kg' => 11.2,
                        'microchip_number' => '985141008876123',
                        'medical_notes' => 'Brachycephalic respiratory management. Keep cool during warm weather.',
                        'allergies' => 'Beef protein',
                    ]
                ]
            ],
            [
                'name' => 'David & Emily Chen',
                'phone' => '+1 (555) 432-9876',
                'email' => 'chen.family@example.com',
                'address' => '15 Maple Grove Lane',
                'emergency_contact' => 'Emily Chen (+1 555-432-9877)',
                'notes' => 'VIP Client - Breeder of Persian Cats.',
                'pets' => [
                    [
                        'name' => 'Cleo',
                        'species' => 'Cat',
                        'breed' => 'Persian',
                        'gender' => 'Female',
                        'date_of_birth' => '2022-11-05',
                        'weight_kg' => 3.8,
                        'microchip_number' => '985141003445566',
                        'medical_notes' => 'Requires regular eye tear stain cleaning and grooming.',
                        'allergies' => 'None known',
                    ],
                    [
                        'name' => 'Simba',
                        'species' => 'Cat',
                        'breed' => 'Maine Coon',
                        'gender' => 'Male',
                        'date_of_birth' => '2023-06-15',
                        'weight_kg' => 7.8,
                        'microchip_number' => '985141003445567',
                        'medical_notes' => 'Large framed, healthy coat.',
                        'allergies' => 'None',
                    ]
                ]
            ],
            [
                'name' => 'Robert Taylor',
                'phone' => '+1 (555) 678-1234',
                'email' => 'rtaylor78@example.com',
                'address' => '402 Pinecrest Avenue',
                'emergency_contact' => 'Jane Taylor (+1 555-678-1235)',
                'notes' => 'Senior dog owner. Prefers detailed invoices.',
                'pets' => [
                    [
                        'name' => 'Max',
                        'species' => 'Dog',
                        'breed' => 'German Shepherd',
                        'gender' => 'Male',
                        'date_of_birth' => '2018-03-14',
                        'weight_kg' => 34.0,
                        'microchip_number' => '985141007788990',
                        'medical_notes' => 'Hip dysplasia grade 2. Takes daily joint supplements.',
                        'allergies' => 'None',
                    ]
                ]
            ]
        ];

        $createdCustomers = [];
        $createdPets = [];

        foreach ($customersData as $cData) {
            $petsList = $cData['pets'];
            unset($cData['pets']);
            $customer = Customer::create($cData);
            $createdCustomers[] = $customer;

            foreach ($petsList as $pData) {
                $pData['customer_id'] = $customer->id;
                $pet = Pet::create($pData);
                $createdPets[$pet->name] = $pet;
            }
        }

        // 5. Create Sample Invoices with Automatic Inventory Deduction and History
        // Invoice 1: Sarah Jenkins (Bailey - Vaccination + Flea Chews)
        $inv1 = Invoice::create([
            'invoice_number' => 'INV-2026-0001',
            'customer_id' => $createdCustomers[0]->id,
            'pet_id' => $createdPets['Bailey']->id,
            'subtotal' => 82.50,
            'discount_type' => 'fixed',
            'discount_value' => 5.00,
            'discount_amount' => 5.00,
            'tax_rate' => 0.00,
            'tax_amount' => 0.00,
            'total_amount' => 77.50,
            'paid_amount' => 80.00,
            'change_amount' => 2.50,
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'visit_reason' => 'Annual Vaccination & Flea Protection',
            'notes' => 'Bailey was very calm during the exam.',
            'diagnosis_treatment' => 'Administered DHPP booster and provided 1 month NexGard.',
            'created_at' => now()->subDays(12),
        ]);

        InvoiceItem::create([
            'invoice_id' => $inv1->id,
            'inventory_item_id' => $createdItems['SRV-CONS-GEN']->id,
            'item_name' => 'General Veterinary Consultation & Physical Exam',
            'unit_price' => 35.00,
            'quantity' => 1,
            'subtotal' => 35.00,
            'instructions' => 'Routine vitals normal. Body weight: 29.5 kg.',
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv1->id,
            'inventory_item_id' => $createdItems['VAC-DHPP-01']->id,
            'item_name' => 'Canine 5-in-1 DHPP Vaccine (Nobivac)',
            'unit_price' => 25.00,
            'quantity' => 1,
            'subtotal' => 25.00,
            'instructions' => 'Subcutaneous injection right shoulder. Next due: 1 year.',
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv1->id,
            'inventory_item_id' => $createdItems['PAR-NEXG-MED']->id,
            'item_name' => 'NexGard Chewable (10.1 - 24 kg)',
            'unit_price' => 22.50,
            'quantity' => 1,
            'subtotal' => 22.50,
            'instructions' => 'Give 1 chewable tablet orally with meal once monthly.',
        ]);

        // Invoice 2: Marcus Rodriguez (Luna - Skin infection treatment)
        $inv2 = Invoice::create([
            'invoice_number' => 'INV-2026-0002',
            'customer_id' => $createdCustomers[1]->id,
            'pet_id' => $createdPets['Luna']->id,
            'subtotal' => 103.00,
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'discount_amount' => 10.30,
            'tax_rate' => 0.00,
            'tax_amount' => 0.00,
            'total_amount' => 92.70,
            'paid_amount' => 92.70,
            'change_amount' => 0.00,
            'payment_status' => 'paid',
            'payment_method' => 'gcash',
            'visit_reason' => 'Skin Lesions & Medicated Grooming',
            'notes' => 'Owner reported scratching around paws and ears.',
            'diagnosis_treatment' => 'Superficial pyoderma and yeast overgrowth. Prescribed Clavamox 14 tablets and medicated grooming.',
            'created_at' => now()->subDays(5),
        ]);

        InvoiceItem::create([
            'invoice_id' => $inv2->id,
            'inventory_item_id' => $createdItems['SRV-CONS-GEN']->id,
            'item_name' => 'General Veterinary Consultation & Physical Exam',
            'unit_price' => 35.00,
            'quantity' => 1,
            'subtotal' => 35.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv2->id,
            'inventory_item_id' => $createdItems['SRV-GROOM-FULL']->id,
            'item_name' => 'Full Medicated Grooming & Nail Trim (Medium Dog)',
            'unit_price' => 40.00,
            'quantity' => 1,
            'subtotal' => 40.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv2->id,
            'inventory_item_id' => $createdItems['MED-AMOX-500']->id,
            'item_name' => 'Amoxicillin + Clavulanate (Clavamox)',
            'unit_price' => 2.80,
            'quantity' => 10,
            'subtotal' => 28.00,
            'instructions' => '1 tablet every 12 hours after food for 5 days.',
        ]);

        // Invoice 3: David & Emily Chen (Cleo - Gastro food & Consultation)
        $inv3 = Invoice::create([
            'invoice_number' => 'INV-2026-0003',
            'customer_id' => $createdCustomers[2]->id,
            'pet_id' => $createdPets['Cleo']->id,
            'subtotal' => 71.00,
            'discount_type' => 'fixed',
            'discount_value' => 0.00,
            'discount_amount' => 0.00,
            'tax_rate' => 0.00,
            'tax_amount' => 0.00,
            'total_amount' => 71.00,
            'paid_amount' => 71.00,
            'change_amount' => 0.00,
            'payment_status' => 'paid',
            'payment_method' => 'credit_card',
            'visit_reason' => 'Urinary Dietary Prescription & General Checkup',
            'notes' => 'Routine checkup and food pickup.',
            'diagnosis_treatment' => 'Urinary bladder ultrasound normal. Continue prescription c/d diet.',
            'created_at' => now()->subDays(1),
        ]);

        InvoiceItem::create([
            'invoice_id' => $inv3->id,
            'inventory_item_id' => $createdItems['SRV-CONS-GEN']->id,
            'item_name' => 'General Veterinary Consultation & Physical Exam',
            'unit_price' => 35.00,
            'quantity' => 1,
            'subtotal' => 35.00,
        ]);
        InvoiceItem::create([
            'invoice_id' => $inv3->id,
            'inventory_item_id' => $createdItems['FOOD-HILLS-UR-15']->id,
            'item_name' => "Hill's Prescription Diet c/d Multicare Feline (1.5kg)",
            'unit_price' => 36.00,
            'quantity' => 1,
            'subtotal' => 36.00,
            'instructions' => 'Feed exclusively for 60 days.',
        ]);
    }
}
