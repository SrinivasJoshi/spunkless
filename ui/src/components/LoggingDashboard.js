// src/components/LoggingDashboard.js
import React from 'react';
import { useLogs } from '../context/LogContext';

// Component imports (to be created)
import Header from './Header';
import LogsView from './dashboard/LogsView';
import DashboardView from './dashboard/DashboardView';
import LogDetailView from './dashboard/LogDetailView';
import AdvancedSearchView from './dashboard/AdvancedSearchView';

const LoggingDashboard = () => {
    const { activeTab, selectedLog } = useLogs();

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Header with Tabs */}
            <Header />

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Show content based on active tab */}
                {activeTab === 'dashboard' && <DashboardView />}

                {activeTab === 'logs' && !selectedLog && <LogsView />}

                {activeTab === 'advanced-search' && <AdvancedSearchView />}

                {selectedLog && <LogDetailView />}
            </main>
        </div>
    );
};

export default LoggingDashboard;