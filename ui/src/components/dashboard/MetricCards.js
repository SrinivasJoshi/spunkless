// src/components/dashboard/MetricCards.js
import React from 'react';

const MetricCards = ({ stats }) => {
    // If stats aren't loaded yet, show placeholder
    if (!stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Calculate total logs (sum of counts by level)
    const totalLogs = stats?.byLevel?.reduce((sum, item) => sum + item.count, 0) || 0;

    // Calculate error rate (error + critical levels / total)
    const errorLogs = stats?.byLevel?.reduce((sum, item) => {
        if (['error', 'critical'].includes(item.level)) {
            return sum + item.count;
        }
        return sum;
    }, 0) || 0;

    const errorRate = totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(1) : 0;

    // We'd calculate average response time from the stats if it were available
    const avgResponseTime = '235'; // Placeholder

    // Count active services
    const activeServices = stats?.byService?.length || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Logs (24h)</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{totalLogs.toLocaleString()}</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
                <p className="mt-1 text-3xl font-semibold text-red-600">{errorRate}%</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{avgResponseTime}ms</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-sm font-medium text-gray-500">Active Services</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{activeServices}</p>
            </div>
        </div>
    );
};

export default MetricCards;