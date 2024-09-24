import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { CSVLink } from 'react-csv';

function LandPage() {
    const [data, setData] = useState([]);
    const pieChartRef1 = useRef(null); // Ref for Size in Ha Pie Chart
    const pieChartRef2 = useRef(null); // Ref for Parcel Count Pie Chart

    useEffect(() => {
        axios.get('https://ganzbe.onrender.com/table-data/landuseoverview_rwanda')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);


    // Prepare data for pie charts
    const sizeInHaData = {
        labels: data.map(item => item.category_name),
        datasets: [{
            data: data.map(item => item.size_in_ha),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#FF9999', '#C9CBCF', '#B9D1EA'],
        }]
    };

    const parcelCountData = {
        labels: data.map(item => item.category_name),
        datasets: [{
            data: data.map(item => item.parcel_count),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#FF9999', '#C9CBCF', '#B9D1EA'],
        }]
    };

    // Convert data to CSV format
    const csvData = data.map(item => ({
        category_name: item.category_name,
        size_in_ha: item.size_in_ha,
        parcel_count: item.parcel_count
    }));

    return (
        <div className="flex flex-col md:flex-row p-4">
            <main className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold md:mb-3 mt-10">Land Data</h1>
                <p className="text-sm sm:text-base text-gray-400 mb-8">Land usage for Rwanda. This data is gotten from The Rwanda Land Authority</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="w-full">
                        <h2 className="text-lg sm:text-xl font-semibold mb-2">Size in Ha</h2>
                        <div className="relative h-[250px] sm:h-[300px] md:h-[400px]">
                            <Pie
                                data={sizeInHaData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const label = context.label || '';
                                                    const value = context.raw || 0;
                                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                                    const percentage = ((value / total) * 100).toFixed(2);
                                                    return `${label}: ${value} ha (${percentage}%)`;
                                                }
                                            }
                                        }
                                    }
                                }}
                                ref={pieChartRef1}
                            />
                        </div>
                    </div>
                    <div className="w-full">
                        <h2 className="text-lg sm:text-xl font-semibold mb-2">Parcel Count</h2>
                        <div className="relative h-[250px] sm:h-[300px] md:h-[400px]">
                            <Pie
                                data={parcelCountData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const label = context.label || '';
                                                    const value = context.raw || 0;
                                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                                    const percentage = ((value / total) * 100).toFixed(2);
                                                    return `${label}: ${value} parcels (${percentage}%)`;
                                                }
                                            }
                                        }
                                    }
                                }}
                                ref={pieChartRef2}
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold mb-2">Data Table</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Size (Ha)</th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Parcel Count</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base font-medium text-gray-900">{item.category_name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">{item.size_in_ha}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm sm:text-base text-gray-500">{item.parcel_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <CSVLink data={csvData} filename="land_data.csv" className="bg-green-900 text-white px-4 py-2 rounded">
                        Download CSV
                    </CSVLink>
                </div>
            </main>
        </div>
    );
}

export default LandPage;
