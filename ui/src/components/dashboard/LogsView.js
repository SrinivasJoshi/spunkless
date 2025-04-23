// src/components/dashboard/LogsView.js
import React, { useEffect, useContext, useRef, useState } from 'react';
import { LogContext } from '../../context/LogContext';
import LogFilters from './LogFilters';
import LogTable from './LogTable';
import Pagination from '../../utils/Pagination';
import FilterModal from './FilterModal';

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
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and window resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        if (isMobile) {
            setIsFilterModalOpen(false);
        }
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

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.service) count++;
        if (filters.level) count++;
        if (filters.timeRange !== '24h') count++; // Assuming 24h is default
        if (filters.search) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className="flex flex-col min-h-full">
            {/* Mobile Filter Button or Desktop Filters */}
            {isMobile ? (
                <div className="sticky top-0 z-50 bg-gray-100 py-4 px-4 mb-1">
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex items-center justify-between"
                    >
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </span>
                    </button>
                </div>
            ) : (
                <div className="sticky top-0 z-50 bg-gray-100 py-4 px-4 mb-1">
                    <LogFilters
                        filters={filters}
                        services={services}
                        levels={levels}
                        onFilterChange={handleFilterChange}
                    />
                </div>
            )}

            {/* Filter Modal for Mobile */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
            >
                <LogFilters
                    filters={filters}
                    services={services}
                    levels={levels}
                    onFilterChange={handleFilterChange}
                />
            </FilterModal>

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