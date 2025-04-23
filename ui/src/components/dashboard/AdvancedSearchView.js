// src/components/dashboard/AdvancedSearchView.js
import React, { useState, useContext,useEffect } from 'react';
import { LogContext } from '../../context/LogContext';
import LogTable from './LogTable';
import Pagination from '../../utils/Pagination';
import { debounce } from 'lodash';
import FilterModal from './FilterModal';

const AdvancedSearchView = () => {
    const { services, levels, searchLogs, loading: contextLoading } = useContext(LogContext);
    const [query, setQuery] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [timeRange, setTimeRange] = useState({ start: '', end: '' });
    const [metadata, setMetadata] = useState([{ key: '', value: '' }]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTriggered, setSearchTriggered] = useState(false);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Pagination state with reduced limit
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,  // Changed from 50 to 20
        totalCount: 0,
        totalPages: 0
    });

    // Add section loading states
    const [loadingStates, setLoadingStates] = useState({
        services: false,
        levels: false,
        search: false
    });

    // Common input styles
    const inputClass = "w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400";
    const checkboxClass = "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:outline-none focus:border-gray-400";

    const [debouncedSearch] = useState(() =>
        debounce(async (searchParams) => {
            try {
                const response = await searchLogs(searchParams);
                setResults(response.data);
                setPagination(prev => ({
                    ...prev,
                    totalCount: response.pagination.totalCount,
                    totalPages: response.pagination.totalPages
                }));
                setError(null);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }, 300)
    );

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (loading || contextLoading) return;

        try {
            setLoading(true);
            setSearchTriggered(true);
            if (isMobile) {
                setIsFilterModalOpen(false);
            }

            // Filter out empty metadata entries
            const validMetadata = metadata.reduce((acc, item) => {
                if (item.key && item.value) {
                    acc[item.key] = item.value;
                }
                return acc;
            }, {});

            const response = await searchLogs({
                query: query.trim(),
                services: selectedServices,
                levels: selectedLevels,
                timeRange: {
                    start: timeRange.start || undefined,
                    end: timeRange.end || undefined
                },
                metadata: validMetadata,
                page: pagination.page,
                limit: pagination.limit
            });

            setResults(response.data);
            setPagination(prev => ({
                ...prev,
                totalCount: response.pagination.totalCount,
                totalPages: response.pagination.totalPages
            }));
            setError(null);
        } catch (err) {
            console.error('Error performing advanced search:', err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Handle reset form
    const handleReset = () => {
        setQuery('');
        setSelectedServices([]);
        setSelectedLevels([]);
        setTimeRange({ start: '', end: '' });
        setMetadata([{ key: '', value: '' }]);
        setResults([]);
        setSearchTriggered(false);
        setPagination({
            page: 1,
            limit: 20,
            totalCount: 0,
            totalPages: 0
        });
    };

    // Handle service checkbox change
    const handleServiceChange = (service) => {
        setSelectedServices(prev => {
            if (prev.includes(service)) {
                return prev.filter(item => item !== service);
            } else {
                return [...prev, service];
            }
        });
    };

    // Handle level checkbox change
    const handleLevelChange = (level) => {
        setSelectedLevels(prev => {
            if (prev.includes(level)) {
                return prev.filter(item => item !== level);
            } else {
                return [...prev, level];
            }
        });
    };

    // Handle time range changes
    const handleTimeRangeChange = (e) => {
        const { name, value } = e.target;
        setTimeRange(prev => ({ ...prev, [name]: value }));
    };

    // Handle metadata changes
    const handleMetadataChange = (index, field, value) => {
        const updatedMetadata = [...metadata];
        updatedMetadata[index][field] = value;
        setMetadata(updatedMetadata);
    };

    // Add new metadata filter
    const addMetadataFilter = () => {
        setMetadata(prev => [...prev, { key: '', value: '' }]);
    };

    // Remove metadata filter
    const removeMetadataFilter = (index) => {
        setMetadata(prev => prev.filter((_, i) => i !== index));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        // Run the search with the new page (without form submit event)
        handleSearch();
    };

    // Handle viewing a log's details
    const handleViewDetails = (logId) => {
        const logDetailElement = document.getElementById('log-detail');
        const logsElement = document.getElementById('logs');

        if (logDetailElement && logsElement) {
            logsElement.style.display = 'none';
            logDetailElement.style.display = 'block';
        }
    };

    const isLoading = loading || contextLoading;

    // Add active filter indicators
    const hasActiveFilters = () => {
        return query.trim() !== '' ||
            selectedServices.length > 0 ||
            selectedLevels.length > 0 ||
            timeRange.start !== '' ||
            timeRange.end !== '' ||
            metadata.some(m => m.key && m.value);
    };

    const getErrorMessage = (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    return 'Invalid search parameters. Please check your filters.';
                case 429:
                    return 'Too many search requests. Please wait a moment.';
                case 500:
                    return 'Server error. Please try again later.';
                default:
                    return `Search failed: ${error.response.status}`;
            }
        }
        return 'Network error. Please check your connection.';
    };

    // Update loading indicator component
    const LoadingIndicator = ({ loading, children }) => (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
            )}
            {children}
        </div>
    );

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
    
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="mb-6">
            {isMobile ? (
                <>
                    <div className="mb-4">
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left flex items-center justify-between"
                        >
                            <span className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Advanced Search Filters
                                {hasActiveFilters() && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full">
                                        Active
                                    </span>
                                )}
                            </span>
                        </button>
                    </div>
                    <FilterModal 
                        isOpen={isFilterModalOpen} 
                        onClose={() => setIsFilterModalOpen(false)}
                    >
                        <form onSubmit={handleSearch} className="space-y-6">
                            {/* Full Text Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Text Search
                                </label>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className={inputClass}
                                    placeholder="Search logs by content..."
                                />
                            </div>
    
                            {/* Services and Levels */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Services */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                        {services.map(service => (
                                            <div key={service} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`service-${service}`}
                                                    checked={selectedServices.includes(service)}
                                                    onChange={() => handleServiceChange(service)}
                                                    className={checkboxClass}
                                                />
                                                <label htmlFor={`service-${service}`} className="ml-2 text-sm text-gray-700">
                                                    {service}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
    
                                {/* Log Levels */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Log Levels</label>
                                    <div className="space-y-2 p-2 border border-gray-200 rounded-md">
                                        {levels.map(level => (
                                            <div key={level} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`level-${level}`}
                                                    checked={selectedLevels.includes(level)}
                                                    onChange={() => handleLevelChange(level)}
                                                    className={checkboxClass}
                                                />
                                                <label htmlFor={`level-${level}`} className="ml-2 text-sm text-gray-700">
                                                    {level}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
    
                            {/* Time Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="start" className="block text-xs text-gray-500 mb-1">From</label>
                                        <input
                                            type="datetime-local"
                                            name="start"
                                            value={timeRange.start}
                                            onChange={handleTimeRangeChange}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="end" className="block text-xs text-gray-500 mb-1">To</label>
                                        <input
                                            type="datetime-local"
                                            name="end"
                                            value={timeRange.end}
                                            onChange={handleTimeRangeChange}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
    
                            {/* Metadata Filters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Metadata Filters</label>
                                <div className="space-y-3">
                                    {metadata.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                                                <input
                                                    type="text"
                                                    value={item.key}
                                                    onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                                                    placeholder="Key (e.g. userId)"
                                                    className={inputClass}
                                                />
                                                <input
                                                    type="text"
                                                    value={item.value}
                                                    onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                                                    placeholder="Value (e.g. user123)"
                                                    className={inputClass}
                                                />
                                            </div>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMetadataFilter(index)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addMetadataFilter}
                                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Metadata Filter
                                    </button>
                                </div>
                            </div>
    
                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}
    
                            {/* Action buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                {hasActiveFilters() && (
                                    <div className="text-sm text-gray-500 mb-2">
                                        {`Active Filters: ${[
                                            query && 'Search',
                                            selectedServices.length > 0 && 'Services',
                                            selectedLevels.length > 0 && 'Levels',
                                            (timeRange.start || timeRange.end) && 'Time Range',
                                            metadata.some(m => m.key && m.value) && 'Metadata'
                                        ].filter(Boolean).join(', ')}`}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </form>
                    </FilterModal>
                </>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <form onSubmit={handleSearch} className="space-y-6">
                        {/* Full Text Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Text Search
                            </label>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={inputClass}
                                placeholder="Search logs by content..."
                            />
                        </div>
    
                        {/* Services and Levels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Services */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                                    {services.map(service => (
                                        <div key={service} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`service-${service}`}
                                                checked={selectedServices.includes(service)}
                                                onChange={() => handleServiceChange(service)}
                                                className={checkboxClass}
                                            />
                                            <label htmlFor={`service-${service}`} className="ml-2 text-sm text-gray-700">
                                                {service}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
    
                            {/* Log Levels */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Log Levels</label>
                                <div className="space-y-2 p-2 border border-gray-200 rounded-md">
                                    {levels.map(level => (
                                        <div key={level} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`level-${level}`}
                                                checked={selectedLevels.includes(level)}
                                                onChange={() => handleLevelChange(level)}
                                                className={checkboxClass}
                                            />
                                            <label htmlFor={`level-${level}`} className="ml-2 text-sm text-gray-700">
                                                {level}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
    
                        {/* Time Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start" className="block text-xs text-gray-500 mb-1">From</label>
                                    <input
                                        type="datetime-local"
                                        name="start"
                                        value={timeRange.start}
                                        onChange={handleTimeRangeChange}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="end" className="block text-xs text-gray-500 mb-1">To</label>
                                    <input
                                        type="datetime-local"
                                        name="end"
                                        value={timeRange.end}
                                        onChange={handleTimeRangeChange}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
    
                        {/* Metadata Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metadata Filters</label>
                            <div className="space-y-3">
                                {metadata.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                                            <input
                                                type="text"
                                                value={item.key}
                                                onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                                                placeholder="Key (e.g. userId)"
                                                className={inputClass}
                                            />
                                            <input
                                                type="text"
                                                value={item.value}
                                                onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                                                placeholder="Value (e.g. user123)"
                                                className={inputClass}
                                            />
                                        </div>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMetadataFilter(index)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addMetadataFilter}
                                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                >
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Metadata Filter
                                </button>
                            </div>
                        </div>
    
                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
    
                        {/* Action buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            {hasActiveFilters() && (
                                <div className="text-sm text-gray-500 mb-2">
                                    {`Active Filters: ${[
                                        query && 'Search',
                                        selectedServices.length > 0 && 'Services',
                                        selectedLevels.length > 0 && 'Levels',
                                        (timeRange.start || timeRange.end) && 'Time Range',
                                        metadata.some(m => m.key && m.value) && 'Metadata'
                                    ].filter(Boolean).join(', ')}`}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
    
            {/* Search Results */}
            {searchTriggered && (
                <div className="mt-6">
                    {results.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <LogTable
                                logs={results}
                                loading={isLoading}
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
                    ) : !isLoading && (
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
                            No logs found matching your search criteria.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchView;