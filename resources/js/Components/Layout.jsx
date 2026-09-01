import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    CreditCard, 
    Receipt, 
    Package, 
    Users, 
    PawPrint, 
    AlertTriangle, 
    PlusCircle, 
    Menu, 
    X, 
    CheckCircle2, 
    AlertCircle
} from 'lucide-react';

export default function Layout({ children, title }) {
    const { url } = usePage();
    const { flash } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Watch flash messages
    useEffect(() => {
        if (flash?.success) {
            setToastMessage({ type: 'success', text: flash.success });
            const timer = setTimeout(() => setToastMessage(null), 5000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setToastMessage({ type: 'error', text: flash.error });
            const timer = setTimeout(() => setToastMessage(null), 6000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const navItems = [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
        { label: 'New Payment', href: '/invoices/create', icon: CreditCard },
        { label: 'Invoices & Receipts', href: '/invoices', icon: Receipt },
        { label: 'Inventory & Medicines', href: '/inventory', icon: Package },
        { label: 'Customers & Pets', href: '/customers', icon: Users },
    ];

    const isActive = (item) => {
        if (item.exact) {
            return url === item.href;
        }
        return url.startsWith(item.href);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
            {/* Toast Flash Notification */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all bg-white border-emerald-500/40 text-slate-900 shadow-emerald-500/10">
                    {toastMessage.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                    <p className="text-sm font-semibold pr-2 text-slate-800">{toastMessage.text}</p>
                    <button 
                        onClick={() => setToastMessage(null)} 
                        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex lg:flex-col w-64 border-r border-slate-200 bg-white shrink-0 shadow-sm">
                    {/* Brand */}
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
                            <PawPrint className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1 font-display">
                                Isidore <span className="text-emerald-600">Clinic</span>
                            </h1>
                            <p className="text-[11px] text-slate-500 font-medium">Inventory & Records</p>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="px-4 pt-5 pb-2">
                        <Link
                            href="/invoices/create"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>New Invoice</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Main Menu
                        </div>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        active
                                            ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Clinic Status Pill */}
                    <div className="p-4 m-3 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-700">Live Inventory Sync</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                            Auto-deducts items on checkout. Syncs with stock ledger.
                        </p>
                    </div>
                </aside>

                {/* Mobile Menu Backdrop */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <div 
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-50 shadow-2xl">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                                        <PawPrint className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-base font-display">Isidore Clinic</span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="py-4">
                                <Link
                                    href="/invoices/create"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>New Invoice</span>
                                </Link>
                            </div>

                            <nav className="flex-1 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                                                active
                                                    ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-display">
                                    {title || 'Veterinary Management'}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/inventory?filter_stock=low"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Check Low Stock</span>
                            </Link>


                        </div>
                    </header>

                    {/* Page Body */}
                    <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
