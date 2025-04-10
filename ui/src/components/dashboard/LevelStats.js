// src/components/dashboard/LevelStats.js
import React from 'react';

const LevelStats = ({ stats }) => {
    if (!stats || !stats.byLevel || stats.byLevel.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Logs by Level</h3>
                <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500 text-center">No level data available</p>
                    <p className="text-sm text-gray-400 text-center mt-1">Try generating some logs or changing the time range</p>
                </div>
            </div>
        );
    }

    // Find the maximum count for scaling the bars
    const maxCount = stats.byLevel[0].count;

    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Logs by Level</h3>
            <div className="space-y-2">
                {stats.byLevel.map(item => {
                    // Determine color based on level
                    let barColor = 'bg-blue-500';
                    if (item.level === 'error') barColor = 'bg-red-500';
                    else if (item.level === 'warn') barColor = 'bg-yellow-500';
                    else if (item.level === 'critical') barColor = 'bg-red-700';
                    else if (item.level === 'debug') barColor = 'bg-gray-500';

                    return (
                        <div key={item.level} className="flex items-center">
                            <div className="w-20 truncate" title={item.level}>{item.level}</div>
                            <div className="flex-1 mx-2">
                                <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                                    <div
                                        className={`${barColor} h-4`}
                                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-16 text-right font-medium">{item.count}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelStats;