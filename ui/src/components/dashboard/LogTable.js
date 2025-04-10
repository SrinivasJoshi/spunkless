// src/components/dashboard/LogTable.js
import React, { useState } from 'react';
import LogDetailModal from './LogDetailModal';

const LogTable = ({ logs, loading }) => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Format timestamp for display
    const formatTime = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (error) {
            return timestamp;
        }
    };

    // Get badge color based on log level
    const getLevelBadgeClass = (level) => {
        switch (level) {
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

    // Handle viewing log details
    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLog(null);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Show empty state
    if (!logs || logs.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No logs found matching your criteria.
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTime(log.timestamp)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {log.service}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getLevelBadgeClass(log.level)}`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                    {log.message}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={() => handleViewDetails(log)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Log Detail Modal */}
            <LogDetailModal
                log={selectedLog}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default LogTable;