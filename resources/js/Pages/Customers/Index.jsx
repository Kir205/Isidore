import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Modal from '../../Components/Modal';
import Pagination from '../../Components/Pagination';
import {
    Users,
    Search,
    UserPlus,
    Phone,
    ChevronRight,
    Edit,
    Trash2,
    CreditCard
} from 'lucide-react';

export default function Index({ customers, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Customer Form
    const form = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        notes: '',
        // Initial Pet
        pet_name: '',
        pet_species: 'Dog',
        pet_breed: '',
        pet_gender: 'Male',
        pet_weight_kg: '',
        pet_date_of_birth: '',
        pet_medical_notes: '',
        pet_allergies: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customers', { search }, { preserveState: true });
    };

    const openAddModal = () => {
        setEditingCustomer(null);
        form.reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (c) => {
        setEditingCustomer(c);
        form.setData({
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            address: c.address || '',
            emergency_contact: c.emergency_contact || '',
            notes: c.notes || '',
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCustomer) {
            form.put(`/customers/${editingCustomer.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                }
            });
        } else {
            form.post('/customers', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    form.reset();
                }
            });
        }
    };

    const handleDelete = (c) => {
        if (confirm(`Are you sure you want to delete client record for "${c.name}" and all associated pets?`)) {
            router.delete(`/customers/${c.id}`);
        }
    };

    return (
        <Layout title="Clients, Patients & Pet History">
            <Head title="Customer Directory" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Client Directory & Patients</h1>                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Register New Client</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by client name, phone, email, or pet name / breed..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Customers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {customers.data.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-medium text-slate-600">No clients found matching your search.</p>
                        </div>
                    ) : (
                        customers.data.map((c) => (
                            <div
                                key={c.id}
                                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-md"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                                                {c.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" /> <span className="font-mono font-bold text-slate-700">{c.phone}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(c)}
                                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                                                title="Edit Client Info"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(c)}
                                                className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-lg transition-colors"
                                                title="Delete Client"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Registered Pets List */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                            Registered Patients (<strong className="font-mono font-black text-emerald-700">{c.pets?.length || 0}</strong>)
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {c.pets && c.pets.length > 0 ? (
                                                c.pets.map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-800 font-bold"
                                                    >
                                                        🐾 {p.name} <span className="text-[10px] text-slate-500 font-normal">({p.species})</span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No pets registered yet</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats: Total Spend & Visits with Bigger Numbers */}
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Visits</span>
                                            <span className="font-black text-slate-900 font-mono text-base">{c.invoices_count || 0}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Lifetime Spent</span>
                                            <span className="font-black text-emerald-700 font-mono text-base sm:text-lg">
                                                ₱{Number(c.invoices_sum_total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action: View Complete Editable History */}
                                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <Link
                                        href={`/invoices/create?customer_id=${c.id}`}
                                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-bold transition-colors"
                                    >
                                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> New POS
                                    </Link>

                                    <Link
                                        href={`/customers/${c.id}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                                    >
                                        <span>View & Edit History</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Pagination links={customers.links} />
            </div>

            {/* Register / Edit Customer Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingCustomer ? `Edit Client: ${editingCustomer.name}` : 'Register New Client & Pet Patient'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <h4 className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">1. Client / Pet Owner Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                                <input
                                    type="text"
                                    value={form.data.phone}
                                    onChange={(e) => form.setData('phone', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-700 font-bold mb-1">Emergency Contact</label>
                                <input
                                    type="text"
                                    value={form.data.emergency_contact}
                                    onChange={(e) => form.setData('emergency_contact', e.target.value)}
                                    placeholder="Name & contact number"
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">Home Address</label>
                            <input
                                type="text"
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-bold mb-1">General Notes</label>
                            <textarea
                                rows="2"
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                placeholder="Preferred appointment times, VIP notes, etc."
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {!editingCustomer && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <h4 className="font-bold text-teal-700 uppercase tracking-wider text-[11px]">2. Initial Patient / Pet (Optional)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Pet Name</label>
                                    <input
                                        type="text"
                                        value={form.data.pet_name}
                                        onChange={(e) => form.setData('pet_name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Species</label>
                                    <select
                                        value={form.data.pet_species}
                                        onChange={(e) => form.setData('pet_species', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Bird">Bird</option>
                                        <option value="Rabbit">Rabbit</option>
                                        <option value="Reptile">Reptile</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Breed</label>
                                    <input
                                        type="text"
                                        value={form.data.pet_breed}
                                        onChange={(e) => form.setData('pet_breed', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Gender</label>
                                    <select
                                        value={form.data.pet_gender}
                                        onChange={(e) => form.setData('pet_gender', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Neutered Male">Neutered Male</option>
                                        <option value="Spayed Female">Spayed Female</option>
                                        <option value="Unknown">Unknown</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.data.pet_weight_kg}
                                        onChange={(e) => form.setData('pet_weight_kg', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Allergies</label>
                                    <input
                                        type="text"
                                        value={form.data.pet_allergies}
                                        onChange={(e) => form.setData('pet_allergies', e.target.value)}
                                        placeholder="e.g. Penicillin, Beef"
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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
                            disabled={form.processing}
                            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm"
                        >
                            {form.processing ? 'Saving...' : editingCustomer ? 'Update Client' : 'Register Client'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
