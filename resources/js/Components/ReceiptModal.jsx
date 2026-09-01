import React from 'react';
import Modal from './Modal';
import Badge from './Badge';
import { Printer, CheckCircle, Clock, AlertCircle, Sparkles, Phone, MapPin } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, invoice }) {
    if (!invoice) return null;

    const handlePrint = () => {
        window.print();
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Badge variant="emerald"><CheckCircle className="w-3.5 h-3.5" /> PAID</Badge>;
            case 'partial':
                return <Badge variant="amber"><Clock className="w-3.5 h-3.5" /> PARTIAL</Badge>;
            case 'pending':
                return <Badge variant="orange"><Clock className="w-3.5 h-3.5" /> PENDING</Badge>;
            case 'refunded':
                return <Badge variant="rose"><AlertCircle className="w-3.5 h-3.5" /> REFUNDED</Badge>;
            default:
                return <Badge variant="slate">{status?.toUpperCase()}</Badge>;
        }
    };

    const formattedDate = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice & Treatment Receipt" maxWidth="max-w-3xl">
            <div className="space-y-6">
                {/* Printable Container */}
                <div id="printable-receipt" className="bg-white border border-slate-200 rounded-xl p-6 text-slate-900 shadow-sm print:border-none print:p-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-slate-200 gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-600">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">Isidore Animal Clinic</h2>
                                    <p className="text-xs text-slate-500 font-medium">Veterinary Hospital & 24/7 Pharmacy</p>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-slate-600 space-y-1">
                                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> 124 Pet Haven Way, Suite 100</p>
                                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> +63 (02) 8345-6789 | isidore@clinic.ph</p>
                            </div>
                        </div>

                        <div className="text-left sm:text-right">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">Invoice Number</span>
                            <h3 className="text-xl font-black font-mono text-emerald-700">{invoice.invoice_number}</h3>
                            <p className="text-xs text-slate-500 mt-1">{formattedDate}</p>
                            <div className="mt-2">{statusBadge(invoice.payment_status)}</div>
                        </div>
                    </div>

                    {/* Customer & Pet Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pet Owner / Client</span>
                            <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.customer?.name || 'Walk-in Client'}</p>
                            <p className="text-slate-600 mt-0.5">{invoice.customer?.phone}</p>
                            {invoice.customer?.email && <p className="text-slate-500">{invoice.customer.email}</p>}
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Patient / Pet</span>
                            {invoice.pet ? (
                                <>
                                    <p className="font-bold text-slate-900 text-sm mt-0.5">
                                        🐾 {invoice.pet.name} <span className="text-xs font-normal text-slate-600">({invoice.pet.species} - {invoice.pet.breed || 'Mixed'})</span>
                                    </p>
                                    <p className="text-slate-600 mt-0.5">
                                        Weight: {invoice.pet.weight_kg ? `${invoice.pet.weight_kg} kg` : 'N/A'} • Gender: {invoice.pet.gender}
                                    </p>
                                </>
                            ) : (
                                <p className="text-slate-500 mt-1 italic">General Pharmacy / Clinic Purchase</p>
                            )}
                        </div>
                    </div>

                    {/* Diagnosis / Visit Reason if any */}
                    {(invoice.visit_reason || invoice.diagnosis_treatment) && (
                        <div className="py-3 border-b border-slate-200 text-xs space-y-1">
                            {invoice.visit_reason && (
                                <div>
                                    <span className="text-slate-500 font-semibold">Reason for Visit: </span>
                                    <span className="text-slate-800 font-medium">{invoice.visit_reason}</span>
                                </div>
                            )}
                            {invoice.diagnosis_treatment && (
                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-800">
                                    <span className="text-emerald-800 font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                                        Clinical Findings & Treatment Notes:
                                    </span>
                                    {invoice.diagnosis_treatment}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Line Items Table */}
                    <div className="py-4">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-200">
                                    <th className="pb-2 font-bold uppercase text-[10px]">Item & Clinical Treatment</th>
                                    <th className="pb-2 text-center font-bold uppercase text-[10px]">Qty</th>
                                    <th className="pb-2 text-right font-bold uppercase text-[10px]">Unit Price</th>
                                    <th className="pb-2 text-right font-bold uppercase text-[10px]">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.items?.map((item, idx) => (
                                    <tr key={idx} className="py-2.5">
                                        <td className="py-2.5 pr-2">
                                            <div className="font-semibold text-slate-800 text-xs sm:text-sm">{item.item_name}</div>
                                            {item.instructions && (
                                                <div className="text-[11px] text-emerald-700 font-mono mt-0.5 font-medium">
                                                    Rx: {item.instructions}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2.5 text-center text-slate-700 font-bold text-xs">{item.quantity}</td>
                                        <td className="py-2.5 text-right text-slate-600 font-mono font-medium text-xs">₱{Number(item.unit_price).toFixed(2)}</td>
                                        <td className="py-2.5 text-right font-black text-slate-900 font-mono text-xs sm:text-sm">₱{Number(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Summary */}
                    <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">₱{Number(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(invoice.discount_amount) > 0 && (
                            <div className="flex justify-between text-amber-700 font-bold">
                                <span>Discount ({invoice.discount_type === 'percentage' ? `${invoice.discount_value}%` : 'Fixed'})</span>
                                <span className="font-mono">-₱{Number(invoice.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        {Number(invoice.tax_amount) > 0 && (
                            <div className="flex justify-between text-slate-600 font-medium">
                                <span>Tax ({invoice.tax_rate}%)</span>
                                <span className="font-mono text-slate-800 font-bold">+₱{Number(invoice.tax_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                            <span>Total Amount</span>
                            <span className="font-mono text-emerald-700 text-lg sm:text-xl font-black">₱{Number(invoice.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 pt-1">
                            <span>Payment Method</span>
                            <span className="font-bold uppercase text-slate-800">{invoice.payment_method?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Amount Tendered / Paid</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">₱{Number(invoice.paid_amount).toFixed(2)}</span>
                        </div>
                        {Number(invoice.change_amount) > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold text-sm">
                                <span>Change Returned</span>
                                <span className="font-mono font-black">₱{Number(invoice.change_amount).toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
                        <p className="font-bold text-slate-600">Thank you for choosing Isidore Animal Clinic!</p>
                        <p className="mt-0.5">Please consult your veterinarian for follow-up questions or adverse reactions.</p>
                    </div>
                </div>

                {/* Actions (Non-printable) */}
                <div className="flex items-center justify-end gap-3 no-print">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                    >
                        <Printer className="w-4 h-4" /> Print Thermal / A4 Receipt
                    </button>
                </div>
            </div>
        </Modal>
    );
}
