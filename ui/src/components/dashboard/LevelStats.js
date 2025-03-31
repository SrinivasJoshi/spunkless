// src/components/dashboard/LevelStats.js
import React from 'react';

const LevelStats = ({ stats }) => {
    if (!stats || !stats.byLevel || stats.byLevel.length === 0) {
        return (
            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Logs by Level</h3>
                <div className="text-gray-500">No data available</div>
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
                    else if (item.level === 'warning') barColor = 'bg-yellow-500';
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