// src/components/dashboard/FilterModal.js
import React from 'react';

const FilterModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 backdrop-blur-sm bg-black/20 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal content */}
            <div className="relative z-50 w-full max-w-lg max-h-[80vh] bg-white rounded-xl shadow-xl transform transition-transform duration-300 ease-out overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 rounded-t-xl">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto flex-1 px-4 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterModal;