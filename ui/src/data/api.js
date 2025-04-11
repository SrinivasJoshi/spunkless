// src/data/api.js

// Base URL - you'll need to update this to match your backend
const BASE_URL = '';

/**
 * Fetches logs with filtering and pagination
 */
export const getLogs = async (params = {}) => {
    const queryParams = new URLSearchParams();

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const url = `${BASE_URL}/api/logs?${queryParams.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching logs:', error);
        throw error;
    }
};

/**
 * Fetches a single log by ID
 */
export const getLogById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/logs/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching log with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Performs advanced search with full-text capabilities
 */
export const searchLogs = async (searchCriteria) => {
    try {
        const response = await fetch(`${BASE_URL}/api/logs/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchCriteria),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching logs:', error);
        throw error;
    }
};

/**
 * Fetches log statistics and aggregations
 */
export const getStats = async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    try {
        const response = await fetch(`${BASE_URL}/api/stats?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
};

/**
 * Fetches available services and log levels metadata
 */
export const getMetadata = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/metadata`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw error;
    }
};