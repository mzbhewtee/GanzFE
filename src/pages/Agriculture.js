import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';

const AgriculturePage = () => {
    const [agricultureData, setAgricultureData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 200;

    useEffect(() => {
        axios.get('http://localhost:5000/agriculture')
            .then(response => {
                setAgricultureData(response.data || []);
            })
            .catch(error => {
                setError('Error fetching data');
                console.error(error);
            });
    }, []);

    if (error) return <div className="text-red-500">{error}</div>;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = agricultureData.slice(indexOfFirstRow, indexOfLastRow);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(agricultureData.length / rowsPerPage);

    const metadata = {
        source: "https://www.fao.org/faostat/en/#data/QV",
        lastUpdated: "2024-08-18",
        description: "This dataset contains agricultural production data including values for various crops over time.",
        columns: [
            { name: "domain", description: "The domain or category of the data." },
            { name: "area", description: "The geographical area related to the data." },
            { name: "element", description: "The element or type of data being recorded." },
            { name: "year", description: "The year the data was recorded." },
            { name: "value", description: "The recorded value of agricultural production." },
            { name: "unit", description: "The unit of measurement for the value." }
        ],
        notes: "Data is sourced from agricultural records. Ensure to verify with the original source for the most recent updates."
    };

    const lineChartData = {
        labels: currentRows.map(item => item.year),
        datasets: [
            {
                label: 'Agriculture Value',
                data: currentRows.map(item => item.value),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.4, // Creates a curved line
            },
        ],
    };

    const lineChartOptions = {
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
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,  // Adjust this number as needed
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Value',
                },
            },
        },
    };
    

    return (
        <>
            <Helmet>
                <title>Agriculture Data</title>
            </Helmet>
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 overflow-x-auto p-8">
                    <h1 className="text-2xl font-bold mb-4">Agriculture Data</h1>
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
                        <h2 className="text-xl font-semibold mb-2">Agriculture Value Over Time</h2>
                        <div className="relative w-full max-w-full h-[300px] md:h-[400px]">
                            <Line
                                data={lineChartData}
                                options={lineChartOptions}
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
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-2 text-center">No data available</td>
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
                        <CSVLink
                            data={agricultureData}
                            filename={"agriculture_data.csv"}
                            className="px-4 py-2 bg-green-900 text-white rounded-md hover:bg-green-600"
                        >
                            Download Table Data
                        </CSVLink>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AgriculturePage;
