// src/components/TabNavigation.js
import React from 'react';

const TabNavigation = ({ tabs, activeTabId, onTabChange }) => {
    return (
        <div className="mt-4 border-b border-gray-200">
            <nav className="flex space-x-8">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTabId === tab.id}
                        className={`px-3 py-2 text-sm font-medium border-b-2 ${activeTabId === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default TabNavigation;