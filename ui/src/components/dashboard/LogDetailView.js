// src/components/dashboard/LogDetailView.js
import React, { useEffect, useContext } from 'react';
import { LogContext } from '../../context/LogContext';

const LogDetailView = ({ logId }) => {
    const { selectedLog, fetchLogById, loading, error } = useContext(LogContext);

    useEffect(() => {
        // Fetch log details when component mounts or ID changes
        if (logId) {
            fetchLogById(logId);
        }
    }, [logId, fetchLogById]);

    if (loading) return <div>Loading log details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!selectedLog) return <div>No log selected</div>;

    // Render log details
    return (
        <div>
            <h2>Log Details</h2>
            <div>ID: {selectedLog.id}</div>
            <div>Timestamp: {selectedLog.timestamp}</div>
            <div>Service: {selectedLog.service}</div>
            <div>Level: {selectedLog.level}</div>
            <div>Message: {selectedLog.message}</div>

            {/* Display metadata if present */}
            {selectedLog.metadata && (
                <div>
                    <h3>Metadata</h3>
                    <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default LogDetailView;