// src/components/DashboardView.js
import React, { useEffect } from 'react';
import { useLogs } from '../context/LogContext';

// Import dashboard sub-components
import MetricCards from './dashboard/MetricCards';
import ServiceStats from './dashboard/ServiceStats';
import LevelStats from './dashboard/LevelStats';
import TopErrors from './dashboard/TopErrors';

const DashboardView = () => {
    const { fetchStats, stats, loading } = useLogs();

    // Fetch stats on component mount
    useEffect(() => {
        fetchStats('24h'); // Default to 24 hours time range
    }, [fetchStats]);

    if (loading && !stats) {
        return <div className="text-center py-10">Loading dashboard data...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Overview</h2>

                {/* Summary Metrics */}
                <MetricCards stats={stats} />
            </div>

            {/* Stats Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Logs by Service */}
                <ServiceStats stats={stats} />

                {/* Logs by Level */}
                <LevelStats stats={stats} />
            </div>

            {/* Top Errors */}
            <TopErrors stats={stats} />
        </div>
    );
};

export default DashboardView;