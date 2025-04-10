import React from 'react';

const LogDetailModal = ({ log, isOpen, onClose }) => {
    if (!isOpen || !log) return null;

    // Format timestamp for better readability
    const formatTime = (timestamp) => {
        try {
            return new Date(timestamp).toLocaleString();
        } catch (error) {
            return timestamp;
        }
    };

    // Get badge color based on log level
    const getLevelBadgeClass = (level) => {
        switch (level.toLowerCase()) {
            case 'info':
                return 'bg-blue-100 text-blue-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'debug':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                    {/* Modal header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Log Details</h3>
                        <button
                            onClick={onClose}
                            className="rounded-md bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Modal content */}
                    <div className="bg-white px-4 py-4">
                        <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Timestamp</label>
                                    <div className="mt-1 text-sm text-gray-900">{formatTime(log.timestamp)}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Service</label>
                                    <div className="mt-1 text-sm text-gray-900">{log.service}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Level</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getLevelBadgeClass(log.level)}`}>
                                            {log.level}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Host</label>
                                    <div className="mt-1 text-sm text-gray-900">{log.host}</div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Message</label>
                                <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{log.message}</div>
                            </div>

                            {/* Metadata */}
                            {log.metadata && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Metadata</label>
                                    <div className="bg-gray-50 rounded-md p-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(log.metadata).map(([key, value]) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-medium text-gray-500">{key}</label>
                                                    <div className="mt-1 text-sm text-gray-900">
                                                        {typeof value === 'object' ? JSON.stringify(value) : value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal footer */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogDetailModal;