// src/components/dashboard/LogFilters.js
import React, { useState } from 'react';

const LogFilters = ({ filters, services = [], levels = [], onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState({ ...filters });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterChange(localFilters);
    };

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
        <div className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Service Dropdown */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Service</label>
                        <select
                            name="service"
                            value={localFilters.service}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 pr-8 appearance-none bg-no-repeat bg-[length:1em_1em] bg-[right_0.75rem_center]"
                            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>')" }}
                        >
                            <option value="">All Services</option>
                            {services.map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>

                    {/* Level Dropdown */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Level</label>
                        <select
                            name="level"
                            value={localFilters.level}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 pr-8 appearance-none bg-no-repeat bg-[length:1em_1em] bg-[right_0.75rem_center]"
                            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>')" }}
                        >
                            <option value="">All Levels</option>
                            {levels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    {/* Time Range Dropdown */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Time Range</label>
                        <select
                            name="timeRange"
                            value={localFilters.timeRange}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 pr-8 appearance-none bg-no-repeat bg-[length:1em_1em] bg-[right_0.75rem_center]"
                            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>')" }}
                        >
                            <option value="1h">Last 1 Hour</option>
                            <option value="6h">Last 6 Hours</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={localFilters.search}
                            onChange={handleInputChange}
                            placeholder="Search logs..."
                            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300"
                        />
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-200">
                    {/* Sort Options */}
                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">Sort by:</label>
                        <select
                            name="sort"
                            value={localFilters.sort}
                            onChange={handleInputChange}
                            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 pr-8 appearance-none bg-no-repeat bg-[length:1em_1em] bg-[right_0.5rem_center]"
                            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>')" }}
                        >
                            <option value="timestamp">Time</option>
                            <option value="service">Service</option>
                            <option value="level">Level</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">Order:</label>
                        <select
                            name="order"
                            value={localFilters.order}
                            onChange={handleInputChange}
                            className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 pr-8 appearance-none bg-no-repeat bg-[length:1em_1em] bg-[right_0.5rem_center]"
                            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>')" }}
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 ml-auto">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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