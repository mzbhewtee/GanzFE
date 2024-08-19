import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';

const ClimatePage = () => {
    const [emissionsData, setEmissionsData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        axios.get('http://localhost:5000/climate')
            .then(response => {
                setEmissionsData(response.data || []);
            })
            .catch(error => {
                setError('Error fetching data');
                console.error(error);
            });
    }, []);

    if (error) return <div className="text-red-500">{error}</div>;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = emissionsData.slice(indexOfFirstRow, indexOfLastRow);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(emissionsData.length / rowsPerPage);

    const metadata = {
        source: "https://www.fao.org/faostat/en/#data/GT",
        lastUpdated: "2024-08-18",
        description: "This dataset contains climate emissions data over time. The data includes various emissions metrics recorded yearly.",
        columns: [
            { name: "year", description: "The year the emissions data was recorded." },
            { name: "value", description: "The recorded emissions value for the specified year." }
        ],
        notes: "Data is sourced from local climate records. Check the source for the most recent and accurate information."
    };

    const lineChartData = {
        labels: currentRows.map(item => item.year),
        datasets: [
            {
                label: 'Emissions Value',
                data: currentRows.map(item => item.value),
                fill: false,
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
            },
        ],
    };

    return (
        <>
            <div className="flex flex-col md:flex-row">
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <h1 className="text-2xl font-bold mb-4">Climate Data</h1>
                    <div className="bg-gray-100 p-4 rounded-md mb-8 shadow-md">
                        <h2 className="text-xl font-semibold mb-2">Dataset Metadata</h2>
                        <p><strong>Source:</strong> <a href={metadata.source} className="text-blue-500" target="_blank" rel="noopener noreferrer">{metadata.source}</a></p>
                        <p><strong>Last Updated:</strong> {metadata.lastUpdated}</p>
                        <p><strong>Description:</strong> {metadata.description}</p>
                        <h3 className="text-lg font-semibold mt-4">Columns:</h3>
                        <ul className="list-disc list-inside mt-2">
                            {metadata.columns.map((column, index) => (
                                <li key={index}><strong>{column.name}:</strong> {column.description}</li>
                            ))}
                        </ul>
                        <p className="mt-4"><strong>Notes:</strong> {metadata.notes}</p>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Emissions Over Time</h2>
                        <div className="relative w-full max-w-full h-[300px] md:h-[400px]">
                            <Line
                                data={lineChartData}
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
                                                    return `${label}: ${value}`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Year',
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Emissions Value',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Data Table</h2>
                        <div className="bg-white shadow-md rounded-lg p-4">
                            <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentRows.length > 0 ? (
                                            currentRows.map(item => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.domain}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.area}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.element}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.year}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.source}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-2 text-center">No data available</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 mx-1 bg-green-900 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={`px-3 py-2 mx-1 border rounded ${index + 1 === currentPage ? 'bg-green-900 text-white' : 'bg-white text-green-900'}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 mx-1 bg-green-900 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex mt-7 gap-4">
                        <CSVLink data={emissionsData} filename="emissions_data.csv" className="bg-green-900 text-white px-4 py-2 rounded">
                            Download CSV
                        </CSVLink>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ClimatePage;
