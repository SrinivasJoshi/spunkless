// src/components/dashboard/LogsView.js
import React, { useEffect, useContext, useRef } from 'react';
import { LogContext } from '../../context/LogContext';
import LogFilters from './LogFilters';
import LogTable from './LogTable';
import Pagination from '../../utils/Pagination';

const LogsView = () => {
    // Use the context for logs data and actions
    const {
        logs,
        loading,
        error,
        filters,
        setFilters,
        pagination,
        setPagination,
        getLogs,
        services,
        levels
    } = useContext(LogContext);

    // Flag to prevent duplicate API calls
    const initialLoadComplete = useRef(false);

    // On component mount, fetch logs if needed
    useEffect(() => {
        // Only fetch on first render if no logs are present
        if (!initialLoadComplete.current && !logs.length) {
            getLogs();
            initialLoadComplete.current = true;
        }
    }, []);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        // Update filters and fetch new logs
        getLogs(newFilters);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        // Fetch logs with the new page
        getLogs({
            ...filters,
            page: newPage
        });
    };

    // Handle viewing a log's details
    const handleViewDetails = (logId) => {
        // In a real app, this would navigate to the log detail view
        // For now, just show the log detail tab and pass the ID
        const logDetailElement = document.getElementById('log-detail');
        const logsElement = document.getElementById('logs');

        if (logDetailElement && logsElement) {
            logsElement.style.display = 'none';
            logDetailElement.style.display = 'block';

            // In a real app with routing, this would be:
            // navigate(`/logs/${logId}`);
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Sticky Filters */}
            <div className="sticky top-0 z-50 bg-gray-100 py-4 px-4 mb-1">
                <LogFilters
                    filters={filters}
                    services={services}
                    levels={levels}
                    onFilterChange={handleFilterChange}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded shadow overflow-hidden">
                    <LogTable
                        logs={logs}
                        loading={loading}
                        onViewDetails={handleViewDetails}
                    />

                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalCount}
                        itemsPerPage={pagination.limit}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default LogsView;