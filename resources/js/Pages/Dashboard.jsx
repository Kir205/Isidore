import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '../Components/Layout';
import Badge from '../Components/Badge';
import Modal from '../Components/Modal';
import ReceiptModal from '../Components/ReceiptModal';
import {
    CreditCard,
    AlertTriangle,
    Users,
    Package,
    FileText,
    CheckCircle,
    TrendingUp,
    ChevronRight,
    Sparkles,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';

export default function Dashboard({ stats, lowStockItems, recentInvoices, revenueChart }) {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [restockItem, setRestockItem] = useState(null);

    // Restock form
    const { data, setData, post, processing, reset } = useForm({
        adjustment_type: 'restock',
        quantity: 20,
        note: 'Quick Restock from Dashboard Alert',
    });

    const handleQuickRestock = (e) => {
        e.preventDefault();
        if (!restockItem) return;
        post(`/inventory/${restockItem.id}/adjust-stock`, {
            onSuccess: () => {
                setRestockItem(null);
                reset();
            },
        });
    };

    const maxChartRevenue = Math.max(...revenueChart.map(d => d.revenue), 100);

    return (
        <Layout title="Veterinary Clinic Overview & Operations">
            <Head title="Clinic Dashboard" />

            <div className="space-y-8">
                {/* Welcome & Quick Action Bar */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/15">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/20">
                                <Sparkles className="w-3.5 h-3.5" /> Isidore Operations Hub
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                                Welcome Back!
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/invoices/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-800 bg-white hover:bg-emerald-50 shadow-lg transition-all hover:scale-[1.02]"
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Record Payment</span>
                            </Link>

                            <Link
                                href="/customers"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-800/60 hover:bg-emerald-800/80 border border-white/20 backdrop-blur-md transition-colors"
                            >
                                <Users className="w-4 h-4 text-emerald-200" />
                                <span>Patients & Clients</span>
                            </Link>

                            <Link
                                href="/inventory"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-800/60 hover:bg-emerald-800/80 border border-white/20 backdrop-blur-md transition-colors"
                            >
                                <Package className="w-4 h-4 text-emerald-200" />
                                <span>Inventory Catalog</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4 Stat KPI Cards with Large Bold Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Today's Revenue */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Revenue</span>
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black text-lg">
                                ₱
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                                ₱{stats.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                                <span className="text-emerald-700 font-bold">Month to Date:</span> <strong className="font-mono text-slate-800 font-bold">₱{stats.monthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Warnings</span>
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight">
                                {stats.lowStockCount} <span className="text-sm font-semibold text-slate-500">Items</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.outOfStockCount > 0 ? (
                                    <span className="text-rose-600 font-bold">{stats.outOfStockCount} items out of stock!</span>
                                ) : (
                                    'Need reordering soon'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Total Invoices */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                                {stats.totalInvoicesCount}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                                <span className="text-blue-700 font-bold">{stats.pendingPaymentsCount} pending</span> payments
                            </p>
                        </div>
                    </div>

                    {/* Active Patients & Clients */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Patients & Owners</span>
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                                {stats.totalPets} <span className="text-sm font-semibold text-slate-500">Pets</span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                                Across <strong className="text-slate-900 font-bold font-mono">{stats.totalCustomers}</strong> registered owners
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Column: Revenue Chart & Low Stock Emergency Action Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 7-Day Revenue Trend (1 Col) */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 font-display">7-Day Revenue Trend</h3>
                                    <p className="text-xs text-slate-500 font-medium">Daily gross payment collections</p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>

                            {/* Bar Chart Visualization */}
                            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2">
                                {revenueChart.map((d, i) => {
                                    const heightPct = Math.max(8, (d.revenue / maxChartRevenue) * 100);
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="text-xs text-slate-800 font-black opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                                                ₱{d.revenue.toFixed(0)}
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-t-lg h-28 flex items-end overflow-hidden p-0.5 border border-slate-200">
                                                <div
                                                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-400"
                                                    style={{ height: `${heightPct}%` }}
                                                />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-600">{d.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">Last 7 Days Total</span>
                            <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                                ₱{revenueChart.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Low Stock Watchlist (2 Cols) */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-base font-bold text-slate-900 font-display">Low Stock & Medication Reorder Alert</h3>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Physical items currently at or below their reorder safety thresholds</p>
                            </div>
                            <Link
                                href="/inventory"
                                className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
                            >
                                View Catalog <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {lowStockItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                                <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                                <p className="text-sm font-bold text-slate-800">All inventory stock levels are healthy!</p>
                                <p className="text-xs text-slate-500 mt-1">No items currently fall below their reorder limits.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-6 px-6 flex-1">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500">
                                            <th className="pb-3 font-bold uppercase text-[10px]">SKU & Medication Name</th>
                                            <th className="pb-3 font-bold uppercase text-[10px]">Category</th>
                                            <th className="pb-3 text-center font-bold uppercase text-[10px]">Current Stock</th>
                                            <th className="pb-3 text-center font-bold uppercase text-[10px]">Threshold</th>
                                            <th className="pb-3 text-right font-bold uppercase text-[10px]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {lowStockItems.slice(0, 5).map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-3">
                                                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono font-bold">{item.sku} • {item.generic_name || item.unit}</div>
                                                </td>
                                                <td className="py-3 whitespace-nowrap">
                                                    <Badge variant={item.category?.color || 'slate'} size="sm">
                                                        {item.category?.name || 'General'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center justify-center min-w-[110px] px-3 py-1 rounded-xl font-mono font-bold shadow-2xs ${item.stock_quantity === 0
                                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                                                        }`}>
                                                        <span className="text-base font-black mr-1">{item.stock_quantity}</span>
                                                        <span className="text-xs font-bold">{item.unit}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center text-slate-700 font-mono font-bold text-sm whitespace-nowrap">
                                                    {item.reorder_level} <span className="text-xs text-slate-500 font-semibold">{item.unit}</span>
                                                </td>
                                                <td className="py-3 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRestockItem(item)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" /> Restock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Invoices / Transactions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 font-display">Recent Patient Invoices & Treatments</h3>
                            <p className="text-xs text-slate-500 font-medium">Recently recorded visits, prescriptions, and payments</p>
                        </div>
                        <Link
                            href="/invoices"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                            View All Invoices <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto -mx-6 px-6">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="pb-3 font-bold uppercase text-[10px]">Invoice #</th>
                                    <th className="pb-3 font-bold uppercase text-[10px]">Client & Patient</th>
                                    <th className="pb-3 font-bold uppercase text-[10px]">Reason / Items</th>
                                    <th className="pb-3 text-right font-bold uppercase text-[10px]">Total Amount</th>
                                    <th className="pb-3 text-center font-bold uppercase text-[10px]">Status</th>
                                    <th className="pb-3 text-right font-bold uppercase text-[10px]">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3.5 font-mono font-black text-emerald-700 text-sm sm:text-base">
                                            {inv.invoice_number}
                                        </td>
                                        <td className="py-3.5">
                                            <div className="font-bold text-slate-900 text-sm">{inv.customer?.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">
                                                {inv.pet ? `🐾 ${inv.pet.name} (${inv.pet.species})` : 'General Purchase'}
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="text-slate-800 font-semibold truncate max-w-xs text-xs">
                                                {inv.visit_reason || inv.items?.map(i => i.item_name).join(', ')}
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium">
                                                <strong className="font-mono text-slate-700 font-bold">{inv.items?.length || 0}</strong> line items • Method: {inv.payment_method?.toUpperCase()}
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-right font-mono font-black text-slate-900 text-base sm:text-lg">
                                            ₱{Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3.5 text-center">
                                            <Badge variant={inv.payment_status === 'paid' ? 'emerald' : 'amber'} size="sm">
                                                {inv.payment_status?.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedInvoice(inv)}
                                                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-slate-500" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Restock Modal */}
            <Modal
                isOpen={!!restockItem}
                onClose={() => setRestockItem(null)}
                title={`Quick Restock: ${restockItem?.name}`}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleQuickRestock} className="space-y-4">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs text-slate-600">
                            Current Stock: <strong className="text-amber-700 font-mono font-black text-base">{restockItem?.stock_quantity} {restockItem?.unit}s</strong>
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                            Reorder Threshold: <strong className="text-slate-900 font-mono font-bold text-sm">{restockItem?.reorder_level} {restockItem?.unit}s</strong>
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity to Add</label>
                        <input
                            type="number"
                            min="1"
                            value={data.quantity}
                            onChange={(e) => setData('quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-black text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note / Supplier Batch</label>
                        <input
                            type="text"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="e.g. Received shipment from MedSupply Inc."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setRestockItem(null)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Add Stock Now'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
            />
        </Layout>
    );
}
