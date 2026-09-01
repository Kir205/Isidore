import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import Pagination from '../../Components/Pagination';
import {
    Package,
    Search,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    History,
    Calendar,
    X,
    Sparkles
} from 'lucide-react';

export default function Index({ items, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [filterStock, setFilterStock] = useState(filters.filter_stock || 'all');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [historyItem, setHistoryItem] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const searchContainerRef = useRef(null);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Instant Live Debounced Search: automatically queries server as user types
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/inventory', {
                    search,
                    category_id: categoryId,
                    filter_stock: filterStock,
                }, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                });
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [search]);

    // Instant familiarized suggestions list from loaded catalog
    const matchingSuggestions = useMemo(() => {
        if (!search || search.trim().length < 1) return [];
        const q = search.toLowerCase().trim();
        return items.data.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(q);
            const genericMatch = item.generic_name && item.generic_name.toLowerCase().includes(q);
            const skuMatch = item.sku.toLowerCase().includes(q);
            return nameMatch || genericMatch || skuMatch;
        }).slice(0, 6);
    }, [search, items.data]);

    const handleClearSearch = () => {
        setSearch('');
        setShowSuggestions(false);
        router.get('/inventory', {
            search: '',
            category_id: categoryId,
            filter_stock: filterStock,
        }, { preserveState: true, replace: true });
    };

    const handleSelectSuggestion = (item) => {
        setSearch(item.name);
        setShowSuggestions(false);
        router.get('/inventory', {
            search: item.name,
            category_id: categoryId,
            filter_stock: filterStock,
        }, { preserveState: true, replace: true });
    };

    // Add / Edit Item Form
    const itemForm = useForm({
        category_id: '',
        sku: '',
        name: '',
        generic_name: '',
        description: '',
        unit: 'tablet',
        cost_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        reorder_level: 10,
        is_service: false,
        batch_number: '',
        expiry_date: '',
        is_active: true,
    });

    // Stock Adjustment Form
    const adjustForm = useForm({
        adjustment_type: 'restock',
        quantity: 1,
        note: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        router.get('/inventory', {
            search,
            category_id: categoryId,
            filter_stock: filterStock,
        }, { preserveState: true, replace: true });
    };

    const handleFilterCategory = (id) => {
        setCategoryId(id);
        router.get('/inventory', {
            search,
            category_id: id,
            filter_stock: filterStock,
        }, { preserveState: true });
    };

    const handleFilterStock = (val) => {
        setFilterStock(val);
        router.get('/inventory', {
            search,
            category_id: categoryId,
            filter_stock: val,
        }, { preserveState: true });
    };

    const openAddModal = () => {
        setEditingItem(null);
        itemForm.reset();
        itemForm.setData({
            category_id: categories[0]?.id || '',
            sku: 'MED-' + Math.floor(1000 + Math.random() * 9000),
            name: '',
            generic_name: '',
            description: '',
            unit: 'tablet',
            cost_price: 0,
            selling_price: 0,
            stock_quantity: 20,
            reorder_level: 10,
            is_service: false,
            batch_number: '',
            expiry_date: '',
            is_active: true,
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        itemForm.setData({
            category_id: item.category_id || '',
            sku: item.sku,
            name: item.name,
            generic_name: item.generic_name || '',
            description: item.description || '',
            unit: item.unit,
            cost_price: item.cost_price,
            selling_price: item.selling_price,
            stock_quantity: item.stock_quantity,
            reorder_level: item.reorder_level,
            is_service: !!item.is_service,
            batch_number: item.batch_number || '',
            expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
            is_active: !!item.is_active,
        });
        setIsAddModalOpen(true);
    };

    const handleItemSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            itemForm.put(`/inventory/${editingItem.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                }
            });
        } else {
            itemForm.post('/inventory', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    itemForm.reset();
                }
            });
        }
    };

    const openAdjustModal = (item) => {
        setAdjustingItem(item);
        adjustForm.reset();
        adjustForm.setData({
            adjustment_type: 'restock',
            quantity: 10,
            note: '',
        });
    };

    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        if (!adjustingItem) return;
        adjustForm.post(`/inventory/${adjustingItem.id}/adjust-stock`, {
            onSuccess: () => {
                setAdjustingItem(null);
                adjustForm.reset();
            }
        });
    };

    const openHistoryModal = async (item) => {
        setHistoryItem(item);
        setLoadingHistory(true);
        try {
            const res = await fetch(`/inventory/${item.id}/stock-history`);
            const json = await res.json();
            setHistoryData(json.movements || []);
        } catch (err) {
            console.error('Failed to load stock movements', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleDeleteItem = (item) => {
        if (confirm(`Are you sure you want to delete "${item.name}" from the catalog?`)) {
            router.delete(`/inventory/${item.id}`);
        }
    };

    return (
        <Layout title="Clinical Inventory & Pharmacy Stock">
            <Head title="Inventory & Stock Management" />

            <div className="space-y-6">
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Inventory Catalog & Stock Ledger</h1>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Item / Service</span>
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Search Input with Instant Live Auto-Suggest */}
                        <div ref={searchContainerRef} className="relative flex-1 max-w-lg">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-medium"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                                        title="Clear Search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </form>

                            {/* Instant Familiarized Auto-Suggest Dropdown */}
                            {showSuggestions && matchingSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Instant Matches ({matchingSuggestions.length})
                                        </span>
                                        <span className="text-[10px] text-slate-400">Click to select product</span>
                                    </div>
                                    {matchingSuggestions.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="p-3 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between gap-3 transition-colors text-xs"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-slate-900 truncate text-sm">{item.name}</div>
                                                <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                                    <span className="font-bold text-slate-700">{item.sku}</span>
                                                    {item.generic_name && (
                                                        <span className="truncate text-slate-400 font-sans">• {item.generic_name}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                                                    ₱{Number(item.selling_price).toFixed(2)}
                                                </div>
                                                <div className="text-[11px] font-mono mt-0.5">
                                                    {item.is_service ? (
                                                        <span className="text-purple-700 font-bold">Service</span>
                                                    ) : item.stock_quantity <= 0 ? (
                                                        <span className="text-rose-600 font-bold">Out of Stock</span>
                                                    ) : (
                                                        <span className="text-emerald-700 font-bold">{item.stock_quantity} {item.unit}s</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stock Quick Filters */}
                        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                            {[
                                { label: 'All Items', val: 'all' },
                                { label: '⚠️ Low Stock', val: 'low' },
                                { label: '🚫 Out of Stock', val: 'out' },
                                { label: '📦 Physical Products', val: 'product' },
                                { label: '🩺 Clinical Services', val: 'service' },
                            ].map((f) => (
                                <button
                                    key={f.val}
                                    type="button"
                                    onClick={() => handleFilterStock(f.val)}
                                    className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${filterStock === f.val
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 scrollbar-none text-xs">
                        <button
                            type="button"
                            onClick={() => handleFilterCategory('')}
                            className={`px-3 py-1 rounded-full font-bold transition-colors ${categoryId === ''
                                ? 'bg-slate-800 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleFilterCategory(cat.id.toString())}
                                className={`px-3 py-1 rounded-full font-bold transition-colors whitespace-nowrap ${categoryId === cat.id.toString()
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.name} <span className="font-mono font-black text-emerald-600">({cat.items_count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px]">SKU & Item Name</th>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Category</th>
                                    <th className="py-3.5 px-4 text-right font-bold uppercase text-[10px] whitespace-nowrap">Cost Price</th>
                                    <th className="py-3.5 px-4 text-right font-bold uppercase text-[10px] whitespace-nowrap">Selling Price</th>
                                    <th className="py-3.5 px-4 text-center font-bold uppercase text-[10px] whitespace-nowrap">Current Stock</th>
                                    <th className="py-3.5 px-4 text-center font-bold uppercase text-[10px] whitespace-nowrap">Reorder Threshold</th>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px] whitespace-nowrap">Expiry / Batch</th>
                                    <th className="py-3.5 px-4 text-right font-bold uppercase text-[10px] whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400">
                                            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p>No inventory items found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    items.data.map((item) => {
                                        const isOut = !item.is_service && item.stock_quantity <= 0;
                                        const isLow = !item.is_service && item.stock_quantity <= item.reorder_level && !isOut;

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono font-bold">
                                                        {item.sku} {item.generic_name ? `• ${item.generic_name}` : ''}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <Badge variant={item.category?.color || 'slate'} size="sm">
                                                        {item.category?.name || 'General'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono text-slate-800 font-black text-base sm:text-lg whitespace-nowrap">
                                                    ₱{Number(item.cost_price).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-700 text-base sm:text-lg whitespace-nowrap">
                                                    ₱{Number(item.selling_price).toFixed(2)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                    {item.is_service ? (
                                                        <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold uppercase tracking-wider">
                                                            Service
                                                        </span>
                                                    ) : isOut ? (
                                                        <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold shadow-2xs">
                                                            <span className="text-base font-black mr-1">0</span>
                                                            <span className="text-xs uppercase font-extrabold tracking-wide">OUT</span>
                                                        </span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold shadow-2xs">
                                                            <span className="text-base font-black mr-1">{item.stock_quantity}</span>
                                                            <span className="text-xs font-bold text-amber-700">{item.unit}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono font-bold shadow-2xs">
                                                            <span className="text-base font-black mr-1">{item.stock_quantity}</span>
                                                            <span className="text-xs font-bold text-emerald-700">{item.unit}</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap">
                                                    {item.is_service ? (
                                                        <span className="text-slate-400 font-bold">-</span>
                                                    ) : (
                                                        <div className="inline-flex items-center justify-center gap-1 text-slate-800">
                                                            <span className="text-base font-black text-slate-900">{item.reorder_level}</span>
                                                            <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                                                    {item.expiry_date ? (
                                                        <span className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                            {item.expiry_date.split('T')[0]}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">N/A</span>
                                                    )}
                                                    {item.batch_number && (
                                                        <div className="text-xs text-slate-500 font-mono font-bold mt-0.5">Lot: {item.batch_number}</div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        {!item.is_service && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openAdjustModal(item)}
                                                                title="Adjust / Restock Quantity"
                                                                className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {!item.is_service && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openHistoryModal(item)}
                                                                title="Stock Movement Ledger"
                                                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                                            >
                                                                <History className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            title="Edit Details"
                                                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteItem(item)}
                                                            title="Delete Item"
                                                            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination links={items.links} />
                </div>
            </div>

            {/* Add / Edit Item Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingItem ? `Edit Item: ${editingItem.name}` : 'Add New Inventory Item / Clinical Service'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleItemSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Item Name *</label>
                            <input
                                type="text"
                                value={itemForm.data.name}
                                onChange={(e) => itemForm.setData('name', e.target.value)}
                                placeholder="e.g. Amoxicillin 250mg, Nobivac DHPP"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none font-medium"
                                required
                            />
                            {itemForm.errors.name && <p className="text-rose-600 text-[10px] mt-1">{itemForm.errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">SKU / Item Code *</label>
                            <input
                                type="text"
                                value={itemForm.data.sku}
                                onChange={(e) => itemForm.setData('sku', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:border-emerald-500 focus:outline-none font-bold text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Category</label>
                            <select
                                value={itemForm.data.category_id}
                                onChange={(e) => itemForm.setData('category_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                            >
                                <option value="">-- No Category --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Item Type</label>
                            <select
                                value={itemForm.data.is_service ? 'service' : 'product'}
                                onChange={(e) => itemForm.setData('is_service', e.target.value === 'service')}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none font-medium"
                            >
                                <option value="product">📦 Physical Product (Track Stock)</option>
                                <option value="service">🩺 Clinical Service (No Stock)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Unit of Measure</label>
                            <input
                                type="text"
                                value={itemForm.data.unit}
                                onChange={(e) => itemForm.setData('unit', e.target.value)}
                                placeholder="tablet, vial, bottle, dose, piece, session"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Generic Name / Active Ingredients</label>
                        <input
                            type="text"
                            value={itemForm.data.generic_name}
                            onChange={(e) => itemForm.setData('generic_name', e.target.value)}
                            placeholder="e.g. Amoxicillin Trihydrate + Potassium Clavulanate"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    {/* Pricing and Stock Counts with Bigger Numbers */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Cost Price (₱)</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={itemForm.data.cost_price}
                                onChange={(e) => itemForm.setData('cost_price', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-black text-lg focus:border-emerald-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Selling Price (₱) *</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={itemForm.data.selling_price}
                                onChange={(e) => itemForm.setData('selling_price', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-black text-emerald-700 text-base"
                                required
                            />
                        </div>

                        {!itemForm.data.is_service && !editingItem && (
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Initial Stock Qty</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.stock_quantity}
                                    onChange={(e) => itemForm.setData('stock_quantity', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-base"
                                    required
                                />
                            </div>
                        )}

                        {!itemForm.data.is_service && (
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Low Stock Limit</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.reorder_level}
                                    onChange={(e) => itemForm.setData('reorder_level', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-base"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {!itemForm.data.is_service && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Batch / Lot Number</label>
                                <input
                                    type="text"
                                    value={itemForm.data.batch_number}
                                    onChange={(e) => itemForm.setData('batch_number', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    value={itemForm.data.expiry_date}
                                    onChange={(e) => itemForm.setData('expiry_date', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Description & Clinical Usage</label>
                        <textarea
                            rows="2"
                            value={itemForm.data.description}
                            onChange={(e) => itemForm.setData('description', e.target.value)}
                            placeholder="Indications, contraindications, and special storage requirements..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={itemForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {itemForm.processing ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Stock Adjustment Modal */}
            <Modal
                isOpen={!!adjustingItem}
                onClose={() => setAdjustingItem(null)}
                title={`Adjust Stock: ${adjustingItem?.name}`}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                        <p className="font-bold text-slate-900 text-sm">{adjustingItem?.name}</p>
                        <p className="text-slate-600 mt-1 font-mono text-sm">
                            Current Stock: <strong className="text-emerald-700 font-black text-base">{adjustingItem?.stock_quantity} {adjustingItem?.unit}s</strong>
                        </p>
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Adjustment Type</label>
                        <select
                            value={adjustForm.data.adjustment_type}
                            onChange={(e) => adjustForm.setData('adjustment_type', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none font-medium"
                        >
                            <option value="restock">➕ Supplier Restock / Delivery (+)</option>
                            <option value="adjustment_add">➕ Inventory Count Discrepancy Add (+)</option>
                            <option value="adjustment_remove">➖ Inventory Count Discrepancy Remove (-)</option>
                            <option value="damage">➖ Broken / Spilled / Damaged Item (-)</option>
                            <option value="expired">➖ Expired Batch Disposal (-)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={adjustForm.data.quantity}
                            onChange={(e) => adjustForm.setData('quantity', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:border-emerald-500 focus:outline-none font-black text-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Audit Reason / Supplier Note</label>
                        <input
                            type="text"
                            value={adjustForm.data.note}
                            onChange={(e) => adjustForm.setData('note', e.target.value)}
                            placeholder="e.g. Purchase Order #PO-9821, quarterly audit count"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setAdjustingItem(null)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={adjustForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {adjustForm.processing ? 'Adjusting...' : 'Save Stock Adjustment'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Stock Movement History Ledger Modal */}
            <Modal
                isOpen={!!historyItem}
                onClose={() => setHistoryItem(null)}
                title={`Stock Movement Ledger: ${historyItem?.name}`}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-4 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-800">
                        <div>
                            <span className="text-xs font-mono text-slate-500 font-bold">{historyItem?.sku}</span>
                            <h4 className="font-bold text-slate-900 text-base">{historyItem?.name}</h4>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500 uppercase font-bold">Live Stock</span>
                            <p className="text-xl font-black font-mono text-emerald-700">{historyItem?.stock_quantity} {historyItem?.unit}s</p>
                        </div>
                    </div>

                    {loadingHistory ? (
                        <div className="py-12 text-center text-slate-500 font-medium">Loading stock audit ledger...</div>
                    ) : historyData.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 font-medium">No stock movements recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-left">
                                <thead className="border-b border-slate-200 text-slate-500 bg-slate-50">
                                    <tr>
                                        <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Date & Time</th>
                                        <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Type</th>
                                        <th className="py-2.5 px-3 text-center font-bold uppercase text-[10px]">Change</th>
                                        <th className="py-2.5 px-3 text-center font-bold uppercase text-[10px]">Prev Stock</th>
                                        <th className="py-2.5 px-3 text-center font-bold uppercase text-[10px]">New Stock</th>
                                        <th className="py-2.5 px-3 font-bold uppercase text-[10px]">Reference / Invoice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono">
                                    {historyData.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50">
                                            <td className="py-2.5 px-3 text-slate-600 font-bold text-xs">
                                                {new Date(m.created_at).toLocaleString()}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className={`px-2 py-0.5 rounded text-[11px] uppercase font-sans font-bold ${m.type === 'sale' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    m.type === 'restock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        m.type === 'return' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                            'bg-amber-50 text-amber-800 border border-amber-200'
                                                    }`}>
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-black text-sm">
                                                <span className={m.quantity_change > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                                                    {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-slate-600 font-bold text-sm">{m.previous_stock}</td>
                                            <td className="py-2.5 px-3 text-center font-black text-slate-900 text-sm">{m.new_stock}</td>
                                            <td className="py-2.5 px-3 font-sans text-slate-700">
                                                {m.reference_note}
                                                {m.invoice && (
                                                    <span className="text-emerald-700 block font-mono text-xs font-black">
                                                        {m.invoice.invoice_number} ({m.invoice.customer?.name})
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setHistoryItem(null)}
                            className="px-4 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl font-semibold"
                        >
                            Close Ledger
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}
