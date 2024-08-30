import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';

const ClimatePage = () => {
    const [climateData, setclimateData] = useState([]);
    const [country, setCountry] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 200;

    const countries = [
        { value: 'climate_rwanda', label: 'Rwanda' },
        { value: 'climate_nigeria', label: 'Nigeria' },
        { value: 'climate_kenya', label: 'Kenya' },
        { value: 'climate_southafrica', label: 'South Africa' },
        { value: 'climate_data', label: 'Africa' }
    ];

    const fetchData = async (selectedCountry) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`https://ganzbe.onrender.com/climate/${selectedCountry}`);
            const sortedData = response.data.sort((a, b) => a.Year - b.Year);
            setclimateData(sortedData || []);
        } catch (error) {
            setError('Error fetching data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCountryChange = (e) => {
        setCountry(e.target.value);
    };

    const handleFetchData = () => {
        if (country) {
            fetchData(country);
        }
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = climateData.slice(indexOfFirstRow, indexOfLastRow);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(climateData.length / rowsPerPage);

    // Find the maximum value in the dataset
    const maxValue = Math.max(...climateData.map(item => item["Value"]));

    // Normalize the data to range from 0 to 100
    const normalizedData = currentRows.map(item => ({
        ...item,
        NormalizedValue: (item["Value"] / maxValue) * 100
    }));

    const lineChartData = {
        labels: normalizedData.map(item => item["Year"]),
        datasets: [
            {
                label: 'climate Value (Normalized)',
                data: normalizedData.map(item => item["NormalizedValue"]),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
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
                        return `${label}: ${value.toFixed(2)}`;
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
                    maxTicksLimit: 10,
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Value (0-100)',
                },
                min: 0,
                max: 100,
            },
        },
    };

    return (
        <>
            <Helmet>
                <title>Climate Data</title>
            </Helmet>
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-4 md:p-8">
                    <h1 className="text-2xl font-bold mb-4">Climate Data</h1>

                    <div className="mb-4">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Select Country:</label>
                        <select
                            id="country"
                            name="country"
                            value={country}
                            onChange={handleCountryChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            <option value="">-- Select a Country --</option>
                            {countries.map((country) => (
                                <option key={country.value} value={country.value}>
                                    {country.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleFetchData}
                        disabled={!country || loading}
                        className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                    >
                        {loading ? 'Loading...' : 'Fetch Data'}
                    </button>

                    {error && <div className="text-red-500 mt-4">{error}</div>}

                    {climateData.length > 0 && !loading && (
                        <>
                            <div className="bg-gray-100 p-4 mt-5 rounded-md mb-8 shadow-md">
                                <h2 className="text-xl font-semibold mb-2">Dataset Metadata</h2>
                                <p><strong>Source:</strong> <a href="https://www.fao.org/faostat/en/#data/QV" className="text-blue-500" target="_blank" rel="noopener noreferrer">https://www.fao.org/faostat/en/#data/QV</a></p>
                                <p><strong>Last Updated:</strong> 2024-08-18</p>
                                <p><strong>Description:</strong> This dataset contains agricultural production data including values for various crops over time.</p>
                                <p><strong>Title:</strong> Value of Agricultural Production</p>
                                <h3 className="text-lg font-semibold mt-4">Columns:</h3>
                                <ul className="list-disc list-inside mt-2">
                                    <li><strong>Element:</strong> The element or type of data being recorded.</li>
                                    <li><strong>Year:</strong> The year the data was recorded.</li>
                                    <li><strong>Value:</strong> The recorded value of agricultural production.</li>
                                    <li><strong>Unit:</strong> The unit of measurement for the value.</li>
                                </ul>
                                <p className="mt-4"><strong>Notes:</strong> Data is sourced from agricultural records. Ensure to verify with the original source for the most recent updates.</p>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-2">Climate Value Over Time</h2>
                                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-4">
                                    <Line data={lineChartData} options={chartOptions} />
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-2">Data Table</h2>
                                <div className="bg-white shadow-md rounded-lg p-4 max-w-4xl mx-auto">
                                    <div className="overflow-x-auto">
                                        <div className="max-h-[400px] overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element</th>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normalized Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {normalizedData.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Element"]}</td>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Year"]}</td>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Unit"]}</td>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Value"]}</td>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["NormalizedValue"].toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8">
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                                    >
                                        Next
                                    </button>
                                </div>
                                <CSVLink
                                    data={climateData}
                                    filename={`climate_data_${country}.csv`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
                                >
                                    Download CSV
                                </CSVLink>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ClimatePage;
