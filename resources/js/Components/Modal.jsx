import React from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative w-full ${maxWidth} bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 transition-all text-slate-900`}>
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="p-6 max-h-[calc(85vh-80px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
