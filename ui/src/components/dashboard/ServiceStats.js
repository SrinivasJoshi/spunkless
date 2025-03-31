// src/components/dashboard/ServiceStats.js
import React from 'react';

const ServiceStats = ({ stats }) => {
    if (!stats || !stats.byService || stats.byService.length === 0) {
        return (
            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Logs by Service</h3>
                <div className="text-gray-500">No data available</div>
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