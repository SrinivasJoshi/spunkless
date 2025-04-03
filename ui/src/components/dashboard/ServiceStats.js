// src/components/dashboard/ServiceStats.js
import React from 'react';

const ServiceStats = ({ stats }) => {
    if (!stats || !stats.byService || stats.byService.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Logs by Service</h3>
                <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    <p className="mt-4 text-gray-500 text-center">No service data available</p>
                    <p className="text-sm text-gray-400 text-center mt-1">Try generating some logs or changing the time range</p>
                </div>
            </div>
        );
    }

    // Find the maximum count for scaling the bars
    const maxCount = stats.byService[0].count;

    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Logs by Service</h3>
            <div className="space-y-2">
                {stats.byService.map(item => (
                    <div key={item.service} className="flex items-center">
                        <div className="w-40 truncate" title={item.service}>{item.service}</div>
                        <div className="flex-1 mx-2">
                            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-500 h-4"
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-16 text-right font-medium">{item.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceStats;