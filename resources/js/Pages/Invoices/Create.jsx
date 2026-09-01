import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Modal from '../../Components/Modal';
import Badge from '../../Components/Badge';
import { 
    CreditCard, 
    Trash2, 
    Search, 
    UserPlus, 
    ShoppingBag, 
    Stethoscope
} from 'lucide-react';

export default function Create({ 
    customers, 
    categories, 
    allItems, 
    nextInvoiceNumber, 
    initialCustomerId, 
    initialPetId 
}) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [itemSearch, setItemSearch] = useState('');
    const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);

    // Main Invoice Form
    const { data, setData, post, processing, errors } = useForm({
        customer_id: initialCustomerId || (customers[0]?.id || ''),
        pet_id: initialPetId || '',
        visit_reason: '',
        diagnosis_treatment: '',
        notes: '',
        discount_type: 'fixed', // 'fixed' | 'percentage'
        discount_value: 0,
        tax_rate: 0,
        payment_status: 'paid',
        payment_method: 'cash',
        paid_amount: 0,
        items: [],
    });

    // Quick customer creation form
    const quickCustomerForm = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        pet_name: '',
        pet_species: 'Dog',
        pet_breed: '',
        pet_gender: 'Male',
        pet_weight_kg: '',
    });

    // Selected customer and their pets
    const selectedCustomer = useMemo(() => {
        return customers.find(c => c.id === parseInt(data.customer_id));
    }, [customers, data.customer_id]);

    const availablePets = useMemo(() => {
        return selectedCustomer?.pets || [];
    }, [selectedCustomer]);

    // Filter catalog items
    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesCategory = selectedCategory === 'all' || 
                (selectedCategory === 'services' ? item.is_service : item.category_id === parseInt(selectedCategory));
            
            const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
                (item.generic_name && item.generic_name.toLowerCase().includes(itemSearch.toLowerCase())) ||
                item.sku.toLowerCase().includes(itemSearch.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [allItems, selectedCategory, itemSearch]);

    // Cart calculations
    const subtotal = useMemo(() => {
        return data.items.reduce((acc, item) => acc + (parseFloat(item.unit_price) * parseInt(item.quantity || 1)), 0);
    }, [data.items]);

    const discountAmount = useMemo(() => {
        const val = parseFloat(data.discount_value) || 0;
        if (data.discount_type === 'percentage') {
            return (subtotal * (val / 100));
        }
        return Math.min(subtotal, val);
    }, [subtotal, data.discount_type, data.discount_value]);

    const taxAmount = useMemo(() => {
        const rate = parseFloat(data.tax_rate) || 0;
        const taxable = Math.max(0, subtotal - discountAmount);
        return taxable * (rate / 100);
    }, [subtotal, discountAmount, data.tax_rate]);

    const totalAmount = useMemo(() => {
        return Math.max(0, (subtotal - discountAmount) + taxAmount);
    }, [subtotal, discountAmount, taxAmount]);

    const changeAmount = useMemo(() => {
        const paid = parseFloat(data.paid_amount) || 0;
        return Math.max(0, paid - totalAmount);
    }, [data.paid_amount, totalAmount]);

    // Cart Handlers
    const addItemToCart = (item) => {
        const existingIndex = data.items.findIndex(i => i.inventory_item_id === item.id);
        if (existingIndex > -1) {
            const updated = [...data.items];
            const currentQty = updated[existingIndex].quantity;
            if (!item.is_service && currentQty >= item.stock_quantity) {
                alert(`Cannot add more. Only ${item.stock_quantity} units available in stock!`);
                return;
            }
            updated[existingIndex].quantity += 1;
            setData('items', updated);
        } else {
            if (!item.is_service && item.stock_quantity <= 0) {
                alert(`"${item.name}" is currently out of stock!`);
                return;
            }
            setData('items', [
                ...data.items,
                {
                    inventory_item_id: item.id,
                    item_name: item.name,
                    unit_price: item.selling_price,
                    quantity: 1,
                    is_service: item.is_service,
                    stock_quantity: item.stock_quantity,
                    instructions: '',
                }
            ]);
        }
    };

    const updateItemQuantity = (index, newQty) => {
        if (newQty <= 0) {
            removeItemFromCart(index);
            return;
        }
        const item = data.items[index];
        if (!item.is_service && newQty > item.stock_quantity) {
            alert(`Stock limit reached. Maximum ${item.stock_quantity} units available.`);
            return;
        }
        const updated = [...data.items];
        updated[index].quantity = parseInt(newQty);
        setData('items', updated);
    };

    const updateItemInstructions = (index, val) => {
        const updated = [...data.items];
        updated[index].instructions = val;
        setData('items', updated);
    };

    const removeItemFromCart = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleExactPay = () => {
        setData('paid_amount', totalAmount.toFixed(2));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            alert('Please add at least one medicine, product, or service to the invoice.');
            return;
        }
        if (!data.paid_amount || parseFloat(data.paid_amount) <= 0) {
            alert('Please enter the paid / tendered amount before proceeding to checkout.');
            return;
        }
        post('/invoices');
    };

    const handleQuickCustomerSubmit = (e) => {
        e.preventDefault();
        quickCustomerForm.post('/customers', {
            onSuccess: () => {
                setShowQuickCustomerModal(false);
                quickCustomerForm.reset();
            }
        });
    };

    return (
        <Layout title="Record Payment & Treatment">
            <Head title="Point of Sale & Invoicing" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Top Banner: Client & Patient Selection */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 font-display">New Patient Invoice & Treatment Checkout</h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Invoice: <span className="font-mono text-emerald-700 font-black text-sm sm:text-base">{nextInvoiceNumber}</span> • Inventory will auto-deduct upon recording
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowQuickCustomerModal(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors self-start lg:self-auto shadow-xs"
                        >
                            <UserPlus className="w-4 h-4 text-emerald-600" />
                            <span>Quick Register Client</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        {/* Customer Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Select Client / Pet Owner <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.customer_id}
                                onChange={(e) => {
                                    setData('customer_id', e.target.value);
                                    setData('pet_id', '');
                                }}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                required
                            >
                                <option value="">-- Choose Client --</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.phone})
                                    </option>
                                ))}
                            </select>
                            {errors.customer_id && <p className="text-rose-500 text-xs mt-1">{errors.customer_id}</p>}
                        </div>

                        {/* Pet Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Select Patient / Pet
                            </label>
                            <select
                                value={data.pet_id}
                                onChange={(e) => setData('pet_id', e.target.value)}
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                            >
                                <option value="">-- Walk-in / Pharmacy Only (No Pet) --</option>
                                {availablePets.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        🐾 {p.name} ({p.species} - {p.breed || 'Mixed'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Visit Reason */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Visit Reason / Procedure
                            </label>
                            <input
                                type="text"
                                value={data.visit_reason}
                                onChange={(e) => setData('visit_reason', e.target.value)}
                                placeholder="e.g. Routine Vaccination, Skin Exam"
                                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2-Column POS Workspace: Catalog (Left) + Active Cart & Totals (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Inventory Catalog (7 Cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                                <div className="relative w-full sm:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={itemSearch}
                                        onChange={(e) => setItemSearch(e.target.value)}
                                        placeholder="Search medicines, vaccines, services..."
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                                    />
                                </div>

                                <div className="text-xs text-slate-500 font-medium">
                                    Showing <strong className="text-slate-900 font-mono font-black text-sm">{filteredItems.length}</strong> items
                                </div>
                            </div>

                            {/* Category Filter Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                        selectedCategory === 'all'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    All Items
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('services')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                        selectedCategory === 'services'
                                            ? 'bg-rose-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Services Only
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                            selectedCategory === cat.id.toString()
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[500px] overflow-y-auto pr-1">
                                {filteredItems.map((item) => {
                                    const isOut = !item.is_service && item.stock_quantity <= 0;
                                    const isLow = !item.is_service && item.stock_quantity <= item.reorder_level && !isOut;

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => !isOut && addItemToCart(item)}
                                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                isOut 
                                                    ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                                                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 shadow-2xs hover:scale-[1.01]'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{item.name}</h4>
                                                    <span className="font-mono font-black text-emerald-700 text-base sm:text-lg shrink-0">
                                                        ₱{Number(item.selling_price).toFixed(2)}
                                                    </span>
                                                </div>
                                                {item.generic_name && (
                                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.generic_name}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px]">
                                                <span className="font-mono text-slate-500 font-bold">{item.sku}</span>
                                                {item.is_service ? (
                                                    <Badge variant="rose" size="sm">Service</Badge>
                                                ) : isOut ? (
                                                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-black font-mono text-xs">Out of Stock</span>
                                                ) : isLow ? (
                                                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-black font-mono text-xs">Low: {item.stock_quantity} {item.unit}s</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-black font-mono text-xs">{item.stock_quantity} {item.unit}s</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Active Cart & Billing Form (5 Cols) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-emerald-600" />
                                        <h3 className="font-bold text-slate-900 text-sm font-display">Invoice Line Items (<span className="font-mono font-black text-emerald-700">{data.items.length}</span>)</h3>
                                    </div>
                                    {data.items.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setData('items', [])}
                                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Cart Items List */}
                                <div className="py-3 space-y-3 max-h-[300px] overflow-y-auto">
                                    {data.items.length === 0 ? (
                                        <div className="py-12 text-center text-slate-400 text-xs">
                                            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p className="font-medium text-slate-600">No items added to invoice yet.</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Click any medication or service on the left to add.</p>
                                        </div>
                                    ) : (
                                        data.items.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{item.item_name}</h5>
                                                        <span className="text-xs sm:text-sm text-emerald-700 font-mono font-black">
                                                            ₱{Number(item.unit_price).toFixed(2)} each
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItemQuantity(idx, item.quantity - 1)}
                                                            className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-black text-sm"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItemQuantity(idx, e.target.value)}
                                                            className="w-14 text-center py-1 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-mono font-black"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => updateItemQuantity(idx, item.quantity + 1)}
                                                            className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-black text-sm"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItemFromCart(idx)}
                                                            className="text-slate-400 hover:text-rose-600 p-1 ml-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Dosage Instructions Field */}
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={item.instructions || ''}
                                                        onChange={(e) => updateItemInstructions(idx, e.target.value)}
                                                        placeholder="Rx instructions (e.g. 1 tab 2x daily after meals)"
                                                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-emerald-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none font-mono font-bold"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Summary & Checkout Controls */}
                            <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                                {/* Discount & Tax Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Discount</label>
                                        <div className="flex rounded-lg overflow-hidden border border-slate-300">
                                            <select
                                                value={data.discount_type}
                                                onChange={(e) => setData('discount_type', e.target.value)}
                                                className="bg-slate-100 text-slate-700 font-black text-xs px-2 border-r border-slate-300 focus:outline-none"
                                            >
                                                <option value="fixed">₱</option>
                                                <option value="percentage">%</option>
                                            </select>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                value={data.discount_value}
                                                onChange={(e) => setData('discount_value', e.target.value)}
                                                className="w-full px-2 py-1 bg-white text-slate-900 font-mono text-sm font-black focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="any"
                                            value={data.tax_rate}
                                            onChange={(e) => setData('tax_rate', e.target.value)}
                                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-sm font-black focus:border-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Financial Ledger Breakdown */}
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
                                    <div className="flex justify-between text-slate-600 font-medium text-xs sm:text-sm">
                                        <span>Subtotal:</span>
                                        <span className="text-slate-900 font-black text-sm sm:text-base">₱{subtotal.toFixed(2)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-amber-700 font-black text-xs sm:text-sm">
                                            <span>Discount:</span>
                                            <span>-₱{discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {taxAmount > 0 && (
                                        <div className="flex justify-between text-slate-600 font-medium text-xs sm:text-sm">
                                            <span>Tax ({data.tax_rate}%):</span>
                                            <span className="text-slate-900 font-black">+₱{taxAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl sm:text-2xl font-black text-slate-900 pt-2 border-t border-slate-200">
                                        <span>Total:</span>
                                        <span className="text-emerald-700 font-black">₱{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Method & Amount Tendered */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Method</label>
                                            <select
                                                value={data.payment_method}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-bold"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="gcash">GCash</option>
                                            </select>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase">Paid / Tendered (₱)</label>
                                                <button
                                                    type="button"
                                                    onClick={handleExactPay}
                                                    className="text-[10px] text-emerald-700 font-black hover:underline"
                                                >
                                                    Exact Amount
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={data.paid_amount}
                                                onChange={(e) => setData('paid_amount', e.target.value)}
                                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-base focus:border-emerald-500 focus:outline-none font-black"
                                            />
                                        </div>
                                    </div>

                                    {changeAmount > 0 && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between text-emerald-800 text-base font-mono font-black">
                                            <span>Change to Return:</span>
                                            <span>₱{changeAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Clinical Notes */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Diagnosis & Clinical Treatment Notes</label>
                                    <textarea
                                        rows="2"
                                        value={data.diagnosis_treatment}
                                        onChange={(e) => setData('diagnosis_treatment', e.target.value)}
                                        placeholder="Enter clinical examination notes, prognosis, or medical instructions..."
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>

                                {/* Submit Checkout */}
                                <button
                                    type="submit"
                                    disabled={processing || data.items.length === 0 || !data.paid_amount || parseFloat(data.paid_amount) <= 0}
                                    className="w-full py-3.5 px-4 rounded-xl font-black text-white text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span>{processing ? 'Processing & Updating Inventory...' : `Complete Checkout & Record Payment (₱${totalAmount.toFixed(2)})`}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Quick Add Client & Patient Modal */}
            <Modal
                isOpen={showQuickCustomerModal}
                onClose={() => setShowQuickCustomerModal(false)}
                title="Quick Register New Client & Patient"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleQuickCustomerSubmit} className="space-y-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">1. Pet Owner Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Owner Name *</label>
                                <input
                                    type="text"
                                    value={quickCustomerForm.data.name}
                                    onChange={(e) => quickCustomerForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                                <input
                                    type="text"
                                    value={quickCustomerForm.data.phone}
                                    onChange={(e) => quickCustomerForm.setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="font-bold text-teal-700 uppercase tracking-wider text-[11px]">2. Patient / Pet Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Pet Name</label>
                                <input
                                    type="text"
                                    value={quickCustomerForm.data.pet_name}
                                    onChange={(e) => quickCustomerForm.setData('pet_name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Species</label>
                                <select
                                    value={quickCustomerForm.data.pet_species}
                                    onChange={(e) => quickCustomerForm.setData('pet_species', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                >
                                    <option value="Dog">Dog</option>
                                    <option value="Cat">Cat</option>
                                    <option value="Bird">Bird</option>
                                    <option value="Rabbit">Rabbit</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Breed</label>
                                <input
                                    type="text"
                                    value={quickCustomerForm.data.pet_breed}
                                    onChange={(e) => quickCustomerForm.setData('pet_breed', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setShowQuickCustomerModal(false)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={quickCustomerForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                        >
                            {quickCustomerForm.processing ? 'Saving...' : 'Register Client'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
