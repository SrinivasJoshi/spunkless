// src/components/dashboard/AdvancedSearchView.js
import React, { useState, useContext } from 'react';
import { LogContext } from '../../context/LogContext';
import LogTable from './LogTable';
import Pagination from '../../utils/Pagination';

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

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 0
    });

    // Handle search form submission
    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        // Prevent search if already loading
        if (loading || contextLoading) return;

        // Validate that at least one search criteria is provided
        if (!query && selectedServices.length === 0 && selectedLevels.length === 0 &&
            !timeRange.start && !timeRange.end && metadata.every(m => !m.key && !m.value)) {
            setError('Please provide at least one search criteria');
            return;
        }

        try {
            setLoading(true);
            setSearchTriggered(true);

            // Format metadata for the API request
            const formattedMetadata = {};
            metadata.forEach(item => {
                if (item.key && item.value) {
                    formattedMetadata[item.key] = item.value;
                }
            });

            // Call the searchLogs function from context
            const response = await searchLogs({
                query,
                services: selectedServices,
                levels: selectedLevels,
                timeRange,
                metadata: formattedMetadata,
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
            setError('Failed to perform search. Please try again.');
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
            limit: 50,
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
        // In a real app with routing, this would navigate to the log detail view
        const logDetailElement = document.getElementById('log-detail');
        const logsElement = document.getElementById('logs');

        if (logDetailElement && logsElement) {
            logsElement.style.display = 'none';
            logDetailElement.style.display = 'block';

            // You would also want to fetch the log details here
            // In a real app, this would be:
            // getLogById(logId);
            // navigate(`/logs/${logId}`);
        }
    };

    const isLoading = loading || contextLoading;

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Advanced Search</h2>

            <div className="bg-white p-6 rounded shadow mb-6">
                <form onSubmit={handleSearch}>
                    {/* Full Text Search */}
                    <div className="mb-6">
                        <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Text Search
                        </label>
                        <input
                            id="query"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Search logs by content..."
                        />
                    </div>

                    {/* Services and Levels */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Services */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {services.map(service => (
                                    <div key={service} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`service-${service}`}
                                            checked={selectedServices.includes(service)}
                                            onChange={() => handleServiceChange(service)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`service-${service}`} className="ml-2 block text-sm text-gray-900">
                                            {service}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Log Levels */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Log Levels</label>
                            <div className="space-y-2">
                                {levels.map(level => (
                                    <div key={level} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`level-${level}`}
                                            checked={selectedLevels.includes(level)}
                                            onChange={() => handleLevelChange(level)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`level-${level}`} className="ml-2 block text-sm text-gray-900">
                                            {level}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start" className="block text-xs text-gray-500 mb-1">From</label>
                                <input
                                    id="start"
                                    type="datetime-local"
                                    name="start"
                                    value={timeRange.start}
                                    onChange={handleTimeRangeChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="end" className="block text-xs text-gray-500 mb-1">To</label>
                                <input
                                    id="end"
                                    type="datetime-local"
                                    name="end"
                                    value={timeRange.end}
                                    onChange={handleTimeRangeChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Metadata Filters */}
                    <div className="mb-6">
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
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                                            placeholder="Value (e.g. user123)"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMetadataFilter(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <span className="sr-only">Remove</span>
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
                                className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                            >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Another Metadata Filter
                            </button>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Search Results */}
            {results.length > 0 && (
                <div className="bg-white rounded shadow overflow-hidden">
                    <h3 className="px-6 py-3 text-lg font-medium text-gray-900 border-b border-gray-200">
                        Search Results
                    </h3>

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
            )}

            {/* No results message */}
            {!isLoading && searchTriggered && results.length === 0 && (
                <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                    No logs found matching your search criteria.
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchView;