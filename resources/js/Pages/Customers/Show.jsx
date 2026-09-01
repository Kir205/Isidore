import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Badge from '../../Components/Badge';
import Modal from '../../Components/Modal';
import ReceiptModal from '../../Components/ReceiptModal';
import { 
    PawPrint, 
    Plus, 
    Edit, 
    Trash2, 
    CreditCard, 
    Receipt, 
    Printer, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    ArrowLeft, 
    History
} from 'lucide-react';

export default function Show({ customer }) {
    const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
    const [editingPet, setEditingPet] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);

    // Customer Edit Form
    const customerForm = useForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        emergency_contact: customer.emergency_contact || '',
        notes: customer.notes || '',
    });

    // Pet Form
    const petForm = useForm({
        customer_id: customer.id,
        name: '',
        species: 'Dog',
        breed: '',
        gender: 'Male',
        weight_kg: '',
        date_of_birth: '',
        microchip_number: '',
        medical_notes: '',
        allergies: '',
    });

    // Invoice / History Record Edit Form
    const invoiceForm = useForm({
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

    // Pet handlers
    const openAddPet = () => {
        setEditingPet(null);
        petForm.reset();
        petForm.setData('customer_id', customer.id);
        setIsAddPetModalOpen(true);
    };

    const openEditPet = (pet) => {
        setEditingPet(pet);
        petForm.setData({
            customer_id: customer.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed || '',
            gender: pet.gender || 'Male',
            weight_kg: pet.weight_kg || '',
            date_of_birth: pet.date_of_birth ? pet.date_of_birth.split('T')[0] : '',
            microchip_number: pet.microchip_number || '',
            medical_notes: pet.medical_notes || '',
            allergies: pet.allergies || '',
        });
        setIsAddPetModalOpen(true);
    };

    const handlePetSubmit = (e) => {
        e.preventDefault();
        if (editingPet) {
            petForm.put(`/pets/${editingPet.id}`, {
                onSuccess: () => {
                    setIsAddPetModalOpen(false);
                    setEditingPet(null);
                }
            });
        } else {
            petForm.post('/pets', {
                onSuccess: () => {
                    setIsAddPetModalOpen(false);
                    petForm.reset();
                }
            });
        }
    };

    const handleDeletePet = (pet) => {
        if (confirm(`Remove pet record for "${pet.name}"?`)) {
            router.delete(`/pets/${pet.id}`);
        }
    };

    // Customer edit handler
    const handleCustomerSubmit = (e) => {
        e.preventDefault();
        customerForm.put(`/customers/${customer.id}`, {
            onSuccess: () => setEditingCustomer(false),
        });
    };

    // History Record / Invoice edit handler
    const openEditInvoice = (inv) => {
        setEditingInvoice(inv);
        invoiceForm.setData({
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

    const handleInvoiceSubmit = (e) => {
        e.preventDefault();
        if (!editingInvoice) return;
        invoiceForm.put(`/invoices/${editingInvoice.id}`, {
            onSuccess: () => setEditingInvoice(null),
        });
    };

    const handleDeleteInvoice = (inv) => {
        if (confirm(`Are you sure you want to void / delete Invoice ${inv.invoice_number}? Deducted inventory stock items will be automatically returned to stock.`)) {
            router.delete(`/invoices/${inv.id}`);
        }
    };

    const totalSpent = customer.invoices?.reduce((acc, curr) => acc + (curr.payment_status !== 'refunded' ? parseFloat(curr.paid_amount) : 0), 0) || 0;

    return (
        <Layout title={`Client Profile: ${customer.name}`}>
            <Head title={`History - ${customer.name}`} />

            <div className="space-y-6">
                {/* Back Link & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/customers"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-2xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">{customer.name}</h1>
                                <button
                                    type="button"
                                    onClick={() => setEditingCustomer(true)}
                                    className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                                    title="Edit Client Information"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Client ID: <span className="font-mono text-slate-800 font-black text-sm">#CUST-{customer.id.toString().padStart(4, '0')}</span> • Member since <span className="font-mono font-bold text-slate-700">{new Date(customer.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/invoices/create?customer_id=${customer.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>New Invoice for Client</span>
                        </Link>
                    </div>
                </div>

                {/* 2-Column Overview: Customer & Pets Summary (Left 4 cols) + Editable History Ledger (Right 8 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Client Details & Registered Pets */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Client Info Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Contact & Profile</h3>
                                <button
                                    type="button"
                                    onClick={() => setEditingCustomer(true)}
                                    className="text-xs text-emerald-700 font-bold hover:underline"
                                >
                                    Edit Info
                                </button>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-mono font-bold text-slate-800 text-sm">{customer.phone}</span>
                                </div>
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-start gap-2 text-slate-700">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span>{customer.address}</span>
                                    </div>
                                )}
                                {customer.emergency_contact && (
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
                                        <span className="text-slate-500 block uppercase font-bold text-[10px]">Emergency Contact:</span>
                                        <span className="text-slate-800 font-bold font-mono">{customer.emergency_contact}</span>
                                    </div>
                                )}
                                {customer.notes && (
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
                                        <span className="text-slate-500 block uppercase font-bold text-[10px]">Client Notes:</span>
                                        <span className="text-slate-700">{customer.notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Visits</span>
                                    <span className="font-black text-slate-900 font-mono text-base">{customer.invoices?.length || 0}</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Spent</span>
                                    <span className="font-black text-emerald-700 font-mono text-base sm:text-lg">₱{totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Registered Pets Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <PawPrint className="w-4 h-4 text-emerald-600" />
                                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                        Patients / Pets (<strong className="font-mono font-black text-emerald-700">{customer.pets?.length || 0}</strong>)
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={openAddPet}
                                    className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Pet
                                </button>
                            </div>

                            <div className="space-y-3">
                                {customer.pets && customer.pets.length > 0 ? (
                                    customer.pets.map((pet) => (
                                        <div
                                            key={pet.id}
                                            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                                        🐾 {pet.name}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                        {pet.species} • {pet.breed || 'Mixed Breed'} • {pet.gender}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditPet(pet)}
                                                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                                                        title="Edit Pet"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePet(pet)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200"
                                                        title="Delete Pet"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 text-xs text-slate-700 font-mono">
                                                {pet.weight_kg && (
                                                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-black">
                                                        Weight: {pet.weight_kg} kg
                                                    </span>
                                                )}
                                                {pet.microchip_number && (
                                                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold">
                                                        Chip: {pet.microchip_number}
                                                    </span>
                                                )}
                                            </div>

                                            {pet.allergies && (
                                                <div className="text-xs text-rose-700 font-bold">
                                                    ⚠️ Allergies: {pet.allergies}
                                                </div>
                                            )}

                                            {pet.medical_notes && (
                                                <p className="text-xs text-slate-600 italic">
                                                    Notes: {pet.medical_notes}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-slate-400 text-xs">
                                        <PawPrint className="w-6 h-6 mx-auto mb-1 opacity-30" />
                                        <p>No pets registered for this client yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editable Customer History Timeline */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <History className="w-5 h-5 text-emerald-600" />
                                        <h3 className="font-bold text-slate-900 text-base font-display">
                                            Editable History & Treatment Timeline
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Complete ledger of past clinical examinations, prescribed medications, and payments (editable)
                                    </p>
                                </div>

                                <Link
                                    href={`/invoices/create?customer_id=${customer.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Visit / Invoice</span>
                                </Link>
                            </div>

                            {/* Timeline Items */}
                            <div className="pt-4 space-y-4">
                                {customer.invoices && customer.invoices.length > 0 ? (
                                    customer.invoices.map((inv) => (
                                        <div
                                            key={inv.id}
                                            className="p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl space-y-3 transition-all shadow-2xs"
                                        >
                                            {/* Top Banner of Record */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                                                            {inv.invoice_number}
                                                        </span>
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
                                                        <span className="text-xs text-slate-600 font-mono font-bold uppercase">
                                                            Method: {inv.payment_method?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span className="font-mono font-bold text-slate-700">{new Date(inv.created_at).toLocaleString()}</span> • Patient: <strong className="text-slate-800">{inv.pet ? inv.pet.name : 'Walk-in / Pharmacy'}</strong>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedReceipt(inv)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" /> Receipt
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditInvoice(inv)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-600 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit Record
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteInvoice(inv)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                                        title="Delete & Restore Stock"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Reason & Clinical Notes */}
                                            <div className="space-y-1.5 text-xs">
                                                {inv.visit_reason && (
                                                    <div>
                                                        <span className="text-slate-500 font-bold">Reason for Visit: </span>
                                                        <span className="text-slate-800 font-medium">{inv.visit_reason}</span>
                                                    </div>
                                                )}
                                                {inv.diagnosis_treatment && (
                                                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800">
                                                        <span className="text-emerald-700 font-bold block text-[11px] uppercase tracking-wider mb-0.5">
                                                            Clinical Findings & Treatment:
                                                        </span>
                                                        {inv.diagnosis_treatment}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Line Items & Medication Dosages */}
                                            <div className="pt-2">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                    Medications Prescribed & Procedures
                                                </span>
                                                <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                                                    {inv.items?.map((item, idx) => (
                                                        <div key={idx} className="p-2.5 flex items-start justify-between gap-3">
                                                            <div>
                                                                <span className="font-bold text-slate-800 text-xs sm:text-sm">{item.item_name}</span>
                                                                <span className="text-emerald-700 text-xs ml-2 font-mono font-black">× {item.quantity}</span>
                                                                {item.instructions && (
                                                                    <div className="text-xs text-emerald-800 font-mono mt-0.5 font-bold">
                                                                        Rx: {item.instructions}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-right font-mono font-black text-slate-900 text-sm sm:text-base shrink-0">
                                                                ₱{Number(item.subtotal).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Financial Summary Row */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-mono">
                                                <div className="text-slate-600 font-bold">
                                                    {Number(inv.discount_amount) > 0 && (
                                                        <span className="text-amber-700">Disc: -₱{Number(inv.discount_amount).toFixed(2)} • </span>
                                                    )}
                                                    <span>Paid: ₱{Number(inv.paid_amount).toFixed(2)}</span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">
                                                    Total: <span className="text-emerald-700 font-black text-base sm:text-lg">₱{Number(inv.total_amount).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-xs">
                                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p>No past visits or invoice records recorded for this client yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Customer Profile Modal */}
            <Modal
                isOpen={editingCustomer}
                onClose={() => setEditingCustomer(false)}
                title={`Edit Profile: ${customer.name}`}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                        <input
                            type="text"
                            value={customerForm.data.name}
                            onChange={(e) => customerForm.setData('name', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                        <input
                            type="text"
                            value={customerForm.data.phone}
                            onChange={(e) => customerForm.setData('phone', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                        <input
                            type="email"
                            value={customerForm.data.email}
                            onChange={(e) => customerForm.setData('email', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Home Address</label>
                        <input
                            type="text"
                            value={customerForm.data.address}
                            onChange={(e) => customerForm.setData('address', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Emergency Contact</label>
                        <input
                            type="text"
                            value={customerForm.data.emergency_contact}
                            onChange={(e) => customerForm.setData('emergency_contact', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Client Notes</label>
                        <textarea
                            rows="2"
                            value={customerForm.data.notes}
                            onChange={(e) => customerForm.setData('notes', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setEditingCustomer(false)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={customerForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {customerForm.processing ? 'Saving...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add / Edit Pet Modal */}
            <Modal
                isOpen={isAddPetModalOpen}
                onClose={() => setIsAddPetModalOpen(false)}
                title={editingPet ? `Edit Pet: ${editingPet.name}` : `Register Pet for ${customer.name}`}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handlePetSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Pet Name *</label>
                            <input
                                type="text"
                                value={petForm.data.name}
                                onChange={(e) => petForm.setData('name', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Species *</label>
                            <select
                                value={petForm.data.species}
                                onChange={(e) => petForm.setData('species', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                            >
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                                <option value="Bird">Bird</option>
                                <option value="Rabbit">Rabbit</option>
                                <option value="Reptile">Reptile</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Breed</label>
                            <input
                                type="text"
                                value={petForm.data.breed}
                                onChange={(e) => petForm.setData('breed', e.target.value)}
                                placeholder="e.g. Golden Retriever, Persian"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Gender</label>
                            <select
                                value={petForm.data.gender}
                                onChange={(e) => petForm.setData('gender', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Neutered Male">Neutered Male</option>
                                <option value="Spayed Female">Spayed Female</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={petForm.data.weight_kg}
                                onChange={(e) => petForm.setData('weight_kg', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Microchip Number</label>
                            <input
                                type="text"
                                value={petForm.data.microchip_number}
                                onChange={(e) => petForm.setData('microchip_number', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Allergies & Contraindications</label>
                        <input
                            type="text"
                            value={petForm.data.allergies}
                            onChange={(e) => petForm.setData('allergies', e.target.value)}
                            placeholder="e.g. Penicillin, Flea saliva, Chicken"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Medical Notes</label>
                        <textarea
                            rows="2"
                            value={petForm.data.medical_notes}
                            onChange={(e) => petForm.setData('medical_notes', e.target.value)}
                            placeholder="Chronic conditions, surgical history, behavior..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => setIsAddPetModalOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={petForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {petForm.processing ? 'Saving...' : editingPet ? 'Update Pet' : 'Register Pet'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Invoice History Modal */}
            <Modal
                isOpen={!!editingInvoice}
                onClose={() => setEditingInvoice(null)}
                title={`Edit Customer Transaction: ${editingInvoice?.invoice_number}`}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleInvoiceSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                            <select
                                value={invoiceForm.data.payment_status}
                                onChange={(e) => invoiceForm.setData('payment_status', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
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
                                value={invoiceForm.data.payment_method}
                                onChange={(e) => invoiceForm.setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
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
                                value={invoiceForm.data.paid_amount}
                                onChange={(e) => invoiceForm.setData('paid_amount', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-black text-base"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Reason for Visit</label>
                            <input
                                type="text"
                                value={invoiceForm.data.visit_reason}
                                onChange={(e) => invoiceForm.setData('visit_reason', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-700 font-bold mb-1">Diagnosis & Treatment History Notes</label>
                        <textarea
                            rows="3"
                            value={invoiceForm.data.diagnosis_treatment}
                            onChange={(e) => invoiceForm.setData('diagnosis_treatment', e.target.value)}
                            placeholder="Update clinical findings, treatment progress, or post-op instructions..."
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
                            disabled={invoiceForm.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {invoiceForm.processing ? 'Saving...' : 'Update History Record'}
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
