import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-slate-200 bg-slate-50/70 rounded-b-2xl">
            <div className="flex flex-1 justify-between sm:hidden">
                {links[0]?.url ? (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed">
                        Previous
                    </span>
                )}
                {links[links.length - 1]?.url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed">
                        Next
                    </span>
                )}
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs text-slate-500 font-medium">
                        Showing page navigation
                    </p>
                </div>
                <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm gap-1" aria-label="Pagination">
                    {links.map((link, idx) => {
                        let cleanLabel = link.label;
                        if (link.label.includes('&laquo;')) cleanLabel = '«';
                        if (link.label.includes('&raquo;')) cleanLabel = '»';

                        if (!link.url) {
                            return (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={idx}
                                href={link.url}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                    link.active
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                                }`}
                                dangerouslySetInnerHTML={{ __html: cleanLabel }}
                            />
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
