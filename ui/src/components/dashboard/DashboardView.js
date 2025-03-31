// src/components/dashboard/DashboardView.js
import React, { useEffect, useState, useContext, useRef } from 'react';
import { LogContext } from '../../context/LogContext';
import MetricCards from './MetricCards';
import ServiceStats from './ServiceStats';
import LevelStats from './LevelStats';
import TopErrors from './TopErrors';

const DashboardView = () => {
  const { getStats, loading, error, stats: contextStats } = useContext(LogContext);
  const [localStats, setLocalStats] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  // Fetch stats when component mounts or timeRange changes
  useEffect(() => {
    // Use existing stats if available
    if (contextStats) {
      setLocalStats(contextStats);
    }

    // Flag to prevent multiple concurrent requests
    if (fetchingRef.current) return;

    const fetchDashboardStats = async () => {
      if (!mountedRef.current) return;

      try {
        fetchingRef.current = true;
        const statsData = await getStats(timeRange);

        if (!mountedRef.current) return;

        if (statsData) {
          setLocalStats(statsData);
        }
      } catch (err) {
        console.error('Error in dashboard stats fetch:', err);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchDashboardStats();

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [timeRange]); // Remove getStats from dependencies

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Use local stats or context stats, whichever is available
  const displayStats = localStats || contextStats;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>

        {/* Time range selector */}
        <div className="flex items-center">
          <label htmlFor="timeRange" className="mr-2 text-sm font-medium text-gray-700">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Show error message if there's an error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && !displayStats && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Dashboard content */}
      {displayStats && (
        <>
          {/* Metric Cards */}
          <MetricCards metrics={displayStats.metrics} />

          {/* Stats Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Service Stats */}
            <ServiceStats data={displayStats.byService} />

            {/* Level Stats */}
            <LevelStats data={displayStats.byLevel} />
          </div>

          {/* Top Errors */}
          <TopErrors data={displayStats.topErrors} />
        </>
      )}
    </div>
  );
};

export default DashboardView;