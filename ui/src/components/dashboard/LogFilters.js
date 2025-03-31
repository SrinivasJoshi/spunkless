// src/components/dashboard/LogFilters.js
import React, { useState } from 'react';

const LogFilters = ({ filters, services = [], levels = [], onFilterChange }) => {
    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({ ...filters });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterChange(localFilters);
    };

    // Reset filters
    const handleReset = () => {
        const resetFilters = {
            service: '',
            level: '',
            timeRange: '24h',
            search: '',
            sort: 'timestamp',
            order: 'desc'
        };

        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="bg-white p-4 rounded shadow mb-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <select
                            name="service"
                            value={localFilters.service}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Services</option>
                            {services.map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <select
                            name="level"
                            value={localFilters.level}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Levels</option>
                            {levels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                        <select
                            name="timeRange"
                            value={localFilters.timeRange}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="1h">Last 1 Hour</option>
                            <option value="6h">Last 6 Hours</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={localFilters.search}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Search logs..."
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-between">
                    {/* Advanced options like sort and order */}
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                            <select
                                name="sort"
                                value={localFilters.sort}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="timestamp">Time</option>
                                <option value="service">Service</option>
                                <option value="level">Level</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mr-2">Order:</label>
                            <select
                                name="order"
                                value={localFilters.order}
                                onChange={handleInputChange}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2">
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
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LogFilters;