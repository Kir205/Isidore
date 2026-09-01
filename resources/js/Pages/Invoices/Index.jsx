import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import ReceiptModal from '../../Components/ReceiptModal';
import Pagination from '../../Components/Pagination';
import { 
    Receipt, 
    Search, 
    Printer, 
    Edit, 
    Trash2, 
    PlusCircle
} from 'lucide-react';

export default function Index({ invoices, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [methodFilter, setMethodFilter] = useState(filters.method || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);

    // Edit Invoice Form
    const editForm = useForm({
        visit_reason: '',
        diagnosis_treatment: '',
        notes: '',
        payment_status: 'paid',
        payment_method: 'cash',
        paid_amount: 0,
        discount_type: 'fixed',
        discount_value: 0,
        tax_rate: 0,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/invoices', {
            search,
            status: statusFilter,
            method: methodFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setMethodFilter('');
        setDateFrom('');
        setDateTo('');
        router.get('/invoices');
    };

    const openEditModal = (inv) => {
        setEditingInvoice(inv);
        editForm.setData({
            visit_reason: inv.visit_reason || '',
            diagnosis_treatment: inv.diagnosis_treatment || '',
            notes: inv.notes || '',
            payment_status: inv.payment_status || 'paid',
            payment_method: inv.payment_method || 'cash',
            paid_amount: inv.paid_amount || 0,
            discount_type: inv.discount_type || 'fixed',
            discount_value: inv.discount_value || 0,
            tax_rate: inv.tax_rate || 0,
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingInvoice) return;
        editForm.put(`/invoices/${editingInvoice.id}`, {
            onSuccess: () => setEditingInvoice(null),
        });
    };

    const handleDeleteInvoice = (inv) => {
        if (confirm(`Are you sure you want to void / delete Invoice ${inv.invoice_number}? Deducted inventory stock items will be automatically returned to inventory.`)) {
            router.delete(`/invoices/${inv.id}`);
        }
    };

    return (
        <Layout title="Invoices, Payments & Patient Billing">
            <Head title="Invoice & Payment History" />

            <div className="space-y-6">
                {/* Header & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Invoices & Billing History</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Editable transaction records with automatic stock restoration on cancellation</p>
                    </div>

                    <Link
                        href="/invoices/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>New Invoice</span>
                    </Link>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by invoice #, owner, pet..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="pending">Pending</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            >
                                <option value="">All Payment Types</option>
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none font-mono"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                            >
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Invoices Table Card */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Invoice #</th>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Client & Patient</th>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Reason & Line Items</th>
                                    <th className="py-3.5 px-4 text-right font-bold uppercase text-[10px]">Total Amount</th>
                                    <th className="py-3.5 px-4 text-center font-bold uppercase text-[10px]">Status</th>
                                    <th className="py-3.5 px-4 text-center font-bold uppercase text-[10px]">Method</th>
                                    <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Date</th>
                                    <th className="py-3.5 px-4 text-right font-bold uppercase text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-400">
                                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                            <p>No invoices found matching your filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.data.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm sm:text-base">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 text-sm">{inv.customer?.name}</div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    {inv.pet ? `🐾 ${inv.pet.name} (${inv.pet.species})` : 'No Pet / Pharmacy'}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="text-slate-800 font-semibold truncate max-w-xs text-xs">
                                                    {inv.visit_reason || inv.items?.map(i => i.item_name).join(', ')}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    <strong className="font-mono text-slate-700 font-bold">{inv.items?.length || 0}</strong> line items
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-base sm:text-lg">
                                                ₱{Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                {Number(inv.discount_amount) > 0 && (
                                                    <div className="text-xs sm:text-sm text-amber-700 font-black">
                                                        -₱{Number(inv.discount_amount).toFixed(2)} off
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <Badge 
                                                    variant={
                                                        inv.payment_status === 'paid' ? 'emerald' : 
                                                        inv.payment_status === 'partial' ? 'amber' : 
                                                        inv.payment_status === 'refunded' ? 'rose' : 'orange'
                                                    } 
                                                    size="sm"
                                                >
                                                    {inv.payment_status?.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono text-xs uppercase text-slate-700 font-bold">
                                                {inv.payment_method?.replace('_', ' ')}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 font-mono font-bold text-xs whitespace-nowrap">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedReceipt(inv)}
                                                        title="Print / View Receipt"
                                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(inv)}
                                                        title="Edit History Record"
                                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteInvoice(inv)}
                                                        title="Void / Delete (Restores Stock)"
                                                        className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination links={invoices.links} />
                </div>
            </div>

            {/* Edit Invoice History Modal */}
            <Modal
                isOpen={!!editingInvoice}
                onClose={() => setEditingInvoice(null)}
                title={`Edit Customer Transaction: ${editingInvoice?.invoice_number}`}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                        <p className="font-bold text-slate-900 text-sm">Client: {editingInvoice?.customer?.name}</p>
                        <p className="text-xs text-slate-500 font-medium">Patient: {editingInvoice?.pet?.name || 'Pharmacy Purchase'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                            <select
                                value={editForm.data.payment_status}
                                onChange={(e) => editForm.setData('payment_status', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                            >
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="pending">Pending</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                            <select
                                value={editForm.data.payment_method}
                                onChange={(e) => editForm.setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium"
                            >
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Paid Amount (₱)</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={editForm.data.paid_amount}
                                onChange={(e) => editForm.setData('paid_amount', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-black text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Visit Reason</label>
                            <input
                                type="text"
                                value={editForm.data.visit_reason}
                                onChange={(e) => editForm.setData('visit_reason', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Diagnosis & Treatment History Notes</label>
                        <textarea
                            rows="3"
                            value={editForm.data.diagnosis_treatment}
                            onChange={(e) => editForm.setData('diagnosis_treatment', e.target.value)}
                            placeholder="Update clinical findings, progress, or advice..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setEditingInvoice(null)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {editForm.processing ? 'Saving...' : 'Update History Record'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Receipt Modal */}
            <ReceiptModal
                isOpen={!!selectedReceipt}
                onClose={() => setSelectedReceipt(null)}
                invoice={selectedReceipt}
            />
        </Layout>
    );
}
