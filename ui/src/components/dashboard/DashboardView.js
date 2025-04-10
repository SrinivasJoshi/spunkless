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

  useEffect(() => {
    const fetchDashboardStats = async () => {

      try {
        const statsData = await getStats(timeRange);

        if (statsData) {
          setLocalStats(statsData);
        }
      } catch (err) {
        console.error('Error in dashboard stats fetch:', err);
      }
    };

    fetchDashboardStats();

  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Use local stats or context stats, whichever is available
  const displayStats = localStats || contextStats;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>

        {/* Improved Time range selector */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label htmlFor="timeRange" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Time Range:
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="w-full sm:w-[180px] px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 pr-8 appearance-none bg-no-repeat bg-[length:1em_1em] bg-[right_0.75rem_center]"
            style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19 9l-7 7-7-7\" /></svg>')" }}
          >
            <option value="1h">Last 1 Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="12h">Last 12 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Show error message if there's an error */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
        <div className="space-y-6">
          {/* Metric Cards */}
          <MetricCards stats={displayStats} />

          {/* Stats Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Stats */}
            <ServiceStats stats={displayStats} />

            {/* Level Stats */}
            <LevelStats stats={displayStats} />
          </div>

          {/* Top Errors */}
          <TopErrors stats={displayStats} />
        </div>
      )}
    </div>
  );
};

export default DashboardView;