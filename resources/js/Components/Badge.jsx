import React from 'react';

export default function Badge({ variant = 'default', children, className = '', size = 'md' }) {
    const variants = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-medium',
        blue: 'bg-blue-50 text-blue-700 border-blue-200/80 font-medium',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 font-medium',
        amber: 'bg-amber-50 text-amber-800 border-amber-200/80 font-medium',
        orange: 'bg-orange-50 text-orange-800 border-orange-200/80 font-medium',
        rose: 'bg-rose-50 text-rose-700 border-rose-200/80 font-medium',
        purple: 'bg-purple-50 text-purple-700 border-purple-200/80 font-medium',
        cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200/80 font-medium',
        slate: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
        default: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs font-medium',
        lg: 'px-3 py-1.5 text-sm font-medium',
    };

    const variantStyle = variants[variant] || variants.default;
    const sizeStyle = sizes[size] || sizes.md;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyle} ${sizeStyle} ${className}`}>
            {children}
        </span>
    );
}
