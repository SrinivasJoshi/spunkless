// src/components/Header.js
import React from 'react';
import { useLogs } from '../context/LogContext';
import TabNavigation from './TabNavigation';

const Header = () => {
    const { activeTab, setActiveTab, selectedLog, setSelectedLog } = useLogs();

    // Array of available tabs
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'logs', label: 'Logs' },
        { id: 'advanced-search', label: 'Advanced Search' }
    ];

    // Handle tab change
    const handleTabChange = (tabId) => {
        // Clear selected log when changing tabs
        if (selectedLog) {
            setSelectedLog(null);
        }

        // Update active tab
        setActiveTab(tabId);
    };

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">Log Management Dashboard</h1>

                {/* Tabs Navigation */}
                <TabNavigation
                    tabs={tabs}
                    activeTabId={activeTab}
                    onTabChange={handleTabChange}
                />
            </div>
        </header>
    );
};

export default Header;