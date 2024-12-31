"use client"

import { useState } from 'react';
import rewardsData from './all_rewards.json';
import DataBox from '@burn/components/databox';
import { CardHeader, CardTitle } from '@burn/components/ui/card';
import { FormatDollarValue } from '@burn/lib/formatting';

// Function to get total rewards
export const GetTotalRewards = (): string => {
    return rewardsData.totals.total_rewards;
};

const AllRewardsSection = () => {
    const [activeTab, setActiveTab] = useState<'validators' | 'delegators' | 'providers' | 'providerDelegators'>('validators');
    const [sortConfig, setSortConfig] = useState<{
        key: 'address' | 'rewards',
        direction: 'asc' | 'desc'
    }>({ key: 'rewards', direction: 'desc' });

    // Helper function to get data based on active tab
    const getActiveData = () => {
        const data = (() => {
            switch (activeTab) {
                case 'validators':
                    return rewardsData.validator_rewards;
                case 'delegators':
                    return rewardsData.validator_delegators;
                case 'providers':
                    return rewardsData.provider_rewards;
                case 'providerDelegators':
                    return rewardsData.provider_delegators;
                default:
                    return [];
            }
        })();

        // Sort the data
        return [...data].sort((a, b) => {
            if (sortConfig.key === 'rewards') {
                const aValue = parseFloat(a.rewards.replace('$', ''));
                const bValue = parseFloat(b.rewards.replace('$', ''));
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return sortConfig.direction === 'asc'
                ? a[sortConfig.key].localeCompare(b[sortConfig.key])
                : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        });
    };

    const requestSort = (key: 'address' | 'rewards') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <>
            <CardHeader className="flex flex-col items-center justify-center border-b py-3">
                <CardTitle className="text-3xl font-bold text-center mt-0 mb-3">
                    LAVA Staking Revenue Distribution
                </CardTitle>
            </CardHeader>

            {/* Totals Section */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(rewardsData.totals)
                    // Filter out total_rewards first
                    .filter(([key]) => key !== 'total_rewards')
                    // Then map the remaining entries
                    .map(([key, value]) => (
                        <DataBox
                            key={key}
                            title={key.replace(/_/g, ' ')}
                            value={FormatDollarValue(value)}
                        />
                    ))
                }
                {/* Add total_rewards last */}
                {/* <DataBox
                    key="total_rewards"
                    title="total rewards"
                    value={FormatDollarValue(rewardsData.totals.total_rewards)}
                /> */}
            </div>

            {/* Tab Navigation */}
            <div className="flex" style={{ marginBottom: '-10px', marginTop: '-20px' }}>
                <button
                    onClick={() => setActiveTab('validators')}
                    className={`px-3 py-1.5 rounded-l ${activeTab === 'validators'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    Validators
                </button>
                <button
                    onClick={() => setActiveTab('delegators')}
                    className={`px-3 py-1.5 border-l border-gray-600 ${activeTab === 'delegators'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    Delegators
                </button>
                <button
                    onClick={() => setActiveTab('providers')}
                    className={`px-3 py-1.5 border-l border-gray-600 ${activeTab === 'providers'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    Providers
                </button>
                <button
                    onClick={() => setActiveTab('providerDelegators')}
                    className={`px-3 py-1.5 border-l border-gray-600 rounded-r ${activeTab === 'providerDelegators'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                        }`}
                >
                    Provider Delegators
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full bg-gray-800">
                    <thead>
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                                onClick={() => requestSort('address')}
                            >
                                Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200"
                                onClick={() => requestSort('rewards')}
                            >
                                Rewards {sortConfig.key === 'rewards' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {getActiveData().map((item, index) => (
                            <tr key={index} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {item.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {FormatDollarValue(item.rewards)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AllRewardsSection;
