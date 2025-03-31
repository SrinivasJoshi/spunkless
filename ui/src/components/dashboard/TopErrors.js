// src/components/dashboard/TopErrors.js
import React from 'react';

const TopErrors = ({ stats }) => {
    if (!stats || !stats.topErrors || stats.topErrors.length === 0) {
        return (
            <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Top Error Messages</h3>
                <div className="text-gray-500">No error data available</div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Top Error Messages</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats.topErrors.map(error => (
                            <tr key={error.message}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{error.message}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{error.count}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-48 bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-red-500 h-2.5 rounded-full"
                                            style={{ width: `${(error.count / stats.topErrors[0].count) * 100}%` }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopErrors;