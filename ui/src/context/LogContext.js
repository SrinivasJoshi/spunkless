// // src/context/LogContext.js
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { getLogs, getStats, getMetadata } from '../data/api';

// // Create the context
// export const LogContext = createContext();

// // Create a provider component
// export const LogProvider = ({ children }) => {
//     // State for logs data
//     const [logs, setLogs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [pagination, setPagination] = useState({
//         page: 1,
//         limit: 50,
//         totalCount: 0,
//         totalPages: 0
//     });

//     // State for filters
//     const [filters, setFilters] = useState({
//         service: '',
//         level: '',
//         startDate: '',
//         endDate: '',
//         search: '',
//         sort: 'timestamp',
//         order: 'desc'
//     });

//     // State for stats
//     const [stats, setStats] = useState(null);

//     // State for metadata (services, levels)
//     const [metadata, setMetadata] = useState({
//         services: [],
//         levels: []
//     });

//     // State for active tab
//     const [activeTab, setActiveTab] = useState('dashboard');

//     // State for selected log (for detail view)
//     const [selectedLog, setSelectedLog] = useState(null);

//     // Function to fetch logs
//     const fetchLogs = async () => {
//         setLoading(true);
//         try {
//             const { service, level, startDate, endDate, search, sort, order } = filters;
//             const { page, limit } = pagination;

//             const result = await getLogs({
//                 service,
//                 level,
//                 startDate,
//                 endDate,
//                 search,
//                 page,
//                 limit,
//                 sort,
//                 order
//             });

//             setLogs(result.data);
//             setPagination(result.pagination);
//             setError(null);
//         } catch (err) {
//             setError('Failed to fetch logs');
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Function to fetch stats
//     const fetchStats = async (timeRange = '24h') => {
//         try {
//             const result = await getStats(timeRange);
//             setStats(result);
//         } catch (err) {
//             console.error('Failed to fetch stats:', err);
//         }
//     };

//     // Function to fetch metadata
//     const fetchMetadata = async () => {
//         try {
//             const result = await getMetadata();
//             setMetadata(result);
//         } catch (err) {
//             console.error('Failed to fetch metadata:', err);
//         }
//     };

//     // Load metadata on initial mount
//     useEffect(() => {
//         fetchMetadata();
//     }, []);

//     // Value to be provided by the context
//     const contextValue = {
//         logs,
//         loading,
//         error,
//         pagination,
//         filters,
//         stats,
//         metadata,
//         activeTab,
//         selectedLog,
//         setFilters,
//         setPagination,
//         fetchLogs,
//         fetchStats,
//         setActiveTab,
//         setSelectedLog
//     };

//     return (
//         <LogContext.Provider value={contextValue}>
//             {children}
//         </LogContext.Provider>
//     );
// };

// // Custom hook to use the log context
// export const useLogs = () => {
//     const context = useContext(LogContext);
//     if (!context) {
//         throw new Error('useLogs must be used within a LogProvider');
//     }
//     return context;
// };

// src/context/LogContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../data/api';

// Create context
export const LogContext = createContext();

// LogProvider component
export const LogProvider = ({ children }) => {
    // UI state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedLog, setSelectedLog] = useState(null);

    // Data state
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [services, setServices] = useState([]);
    const [levels, setLevels] = useState([]);

    // Filtering and pagination
    const [filters, setFilters] = useState({
        service: '',
        level: '',
        timeRange: '24h',
        search: '',
        startDate: '',
        endDate: '',
        sort: 'timestamp',
        order: 'desc'
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 0
    });

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch metadata (services and levels) when component mounts
    useEffect(() => {
        const fetchMetadataInfo = async () => {
            try {
                setLoading(true);
                // Use real API call
                const metadata = await api.getMetadata();
                setServices(metadata.services);
                setLevels(metadata.levels);
            } catch (err) {
                console.error('Error fetching metadata:', err);
                // Fallback to defaults if API fails
                const defaultMetadata = {
                    services: ['auth-service', 'payment-service', 'api-gateway', 'user-service', 'notification-service'],
                    levels: ['debug', 'info', 'warning', 'error', 'critical']
                };
                setServices(defaultMetadata.services);
                setLevels(defaultMetadata.levels);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadataInfo();
    }, []);

    // Function to fetch logs with current filters and pagination
    const getLogs = async (newFilters = null) => {
        try {
            setLoading(true);

            // If new filters are provided, update filters state and reset to page 1
            if (newFilters) {
                setFilters(newFilters);
                setPagination(prev => ({ ...prev, page: 1 }));
            }

            const currentFilters = newFilters || filters;

            try {
                // Call the real API with filters and pagination
                const response = await api.getLogs({
                    ...currentFilters,
                    page: pagination.page,
                    limit: pagination.limit
                });

                setLogs(response.data);
                setPagination(response.pagination);
                setError(null);
            } catch (apiError) {
                console.warn('API call failed:', apiError);
                setError('Failed to load logs. Using fallback data.');

                // Return dummy data as fallback for development
                // This would be removed in production
                const dummyLogs = [
                    { id: 1, timestamp: new Date().toISOString(), service: 'auth-service', level: 'error', message: 'Sample fallback log' },
                    // Add more sample logs as needed
                ];
                setLogs(dummyLogs);
            }
        } catch (err) {
            console.error('Error in getLogs function:', err);
            setError('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch a single log by ID
    const getLogById = async (id) => {
        try {
            setLoading(true);

            try {
                // Use the API to fetch log by ID
                const logData = await api.getLogById(id);
                setSelectedLog(logData);
                setError(null);
            } catch (apiError) {
                console.warn('API call failed:', apiError);
                setError('Failed to load log details. Using fallback data.');

                // Fallback for development purposes
                const fallbackLog = {
                    id,
                    timestamp: new Date().toISOString(),
                    service: 'unknown-service',
                    level: 'info',
                    message: 'Fallback log details',
                    metadata: { note: 'This is fallback data because the API call failed' }
                };
                setSelectedLog(fallbackLog);
            }
        } catch (err) {
            console.error('Error in getLogById function:', err);
            setError('Failed to load log details');
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch stats
    const getStats = async (timeRange = '24h') => {
        try {
            setLoading(true);

            try {
                // Use real API call instead of dummy data
                const statsData = await api.getStats({ timeRange });
                setStats(statsData);
                setError(null);
            } catch (apiError) {
                console.warn('API call failed:', apiError);
                setError('Failed to load statistics. Using fallback data.');

                // Fallback for development purposes
                const fallbackStats = {
                    byService: [
                        { service: 'auth-service', count: 458 },
                        { service: 'payment-service', count: 312 },
                    ],
                    byLevel: [
                        { level: 'info', count: 652 },
                        { level: 'error', count: 189 },
                    ],
                    byHour: [
                        { hour: new Date().toISOString(), count: 120 },
                    ],
                    topErrors: [
                        { message: 'Failed to authenticate user', count: 45 },
                    ]
                };
                setStats(fallbackStats);
            }
        } catch (err) {
            console.error('Error in getStats function:', err);
            setError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    // Search logs with advanced criteria
    const searchLogs = async (searchCriteria) => {
        try {
            setLoading(true);

            try {
                // Use real API call
                const response = await api.searchLogs(searchCriteria);
                setError(null);
                return response;
            } catch (apiError) {
                console.warn('API call failed:', apiError);
                setError('Search failed. Using fallback data.');

                // Return dummy data as fallback
                return {
                    data: [
                        { id: 1, timestamp: new Date().toISOString(), service: 'auth-service', level: 'error', message: 'Sample search result' },
                    ],
                    pagination: {
                        page: 1,
                        limit: 50,
                        totalCount: 1,
                        totalPages: 1
                    }
                };
            }
        } catch (err) {
            console.error('Error in searchLogs function:', err);
            setError('Failed to search logs');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Expose the context value
    const contextValue = {
        // UI state
        activeTab,
        setActiveTab,
        selectedLog,
        setSelectedLog,

        // Data
        logs,
        stats,
        services,
        levels,

        // Filtering and pagination
        filters,
        setFilters,
        pagination,
        setPagination,

        // Loading and error states
        loading,
        error,

        // Functions
        getLogs,
        getLogById,
        getStats,
        searchLogs,

        // Aliases for backward compatibility
        fetchLogs: getLogs,
        fetchLogById: getLogById,
        fetchStats: getStats
    };

    return (
        <LogContext.Provider value={contextValue}>
            {children}
        </LogContext.Provider>
    );
};

// Custom hook for using the log context
export const useLogs = () => {
    const context = useContext(LogContext);

    if (!context) {
        throw new Error('useLogs must be used within a LogProvider');
    }

    return context;
};

export default LogContext;