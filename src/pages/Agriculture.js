import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import MapComponent from '../components/Map';

const AgriculturePage = () => {
    const [agricultureData, setAgricultureData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 200;
    const [activeGraph, setActiveGraph] = useState('line');
    const chartRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(''); // State for selected country
    const countries = agricultureData.map(item => ({
        name: item["Country_Name"],
        code: item["Country_Code"]
    }));

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://ganzbe.onrender.com/table-data/agricultural_land_of_land_area');
            setAgricultureData(response.data || []);
            if (response.data.length > 0) {
                setSelectedCountry(response.data[0]["Country_Code"]); // Default to the first country
            }
        } catch (error) {
            setError('Error fetching data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = agricultureData.slice(indexOfFirstRow, indexOfLastRow);
    const years = currentRows.length > 0
        ? Object.keys(currentRows[0])
            .filter(key => key.startsWith('Year_'))
            .map(year => year.split('_')[1])
            .filter(year => parseInt(year) >= 1961) // Keep only years from 1961 onwards
        : [];


    const calculateWorldData = () => {
        const yearTotals = {};
        const yearCounts = {};

        years.forEach(year => {
            yearTotals[year] = 0;
            yearCounts[year] = 0;
        });

        agricultureData.forEach(item => {
            years.forEach(year => {
                const value = Number(item[`Year_${year}`]) || 0;
                if (value > 0) {
                    yearTotals[year] += value;
                    yearCounts[year] += 1;
                }
            });
        });

        return years.map(year => (yearCounts[year] > 0 ? (yearTotals[year] / yearCounts[year]) : 0));
    };



    const lineChartData = () => {
        const dataPoints = selectedCountry
            ? calculateCountryData() // Calculate for selected country
            : calculateWorldData(); // Calculate for world

        const buffer = 1;
        const minValue = Math.min(...dataPoints) - buffer
        const maxValue = Math.max(...dataPoints) + buffer;
        const stepSize = (maxValue - minValue) / 5;

        return {
            labels: years,
            datasets: [{
                label: 'Years',
                data: dataPoints,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
                tension: 0.4,
            }],
            yAxis: { minValue, maxValue, stepSize },
        };
    };

    const calculateCountryData = () => {
        const yearTotals = {};
        const yearCounts = {};
        const selectedCountryData = agricultureData.find(item => item["Country_Code"] === selectedCountry);

        years.forEach(year => {
            yearTotals[year] = 0;
            yearCounts[year] = 0;
        });

        if (selectedCountryData) {
            years.forEach(year => {
                const value = Number(selectedCountryData[`Year_${year}`]) || 0;
                if (value > 0) {
                    yearTotals[year] += value;
                    yearCounts[year] += 1;
                }
            });
        }

        return years.map(year => (yearCounts[year] > 0 ? (yearTotals[year] / yearCounts[year]) : 0));
    };

    const { labels, datasets, yAxis } = lineChartData();

    const handleCountryChange = (event) => {
        setSelectedCountry(event.target.value);
    };


    // Chart options using the dynamic y-axis values
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
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value.toFixed(2)}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: false,
                    text: 'Year',
                },
                grid: {
                    display: false, // No vertical grid lines
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
                    text: 'Percentage (%)',
                },
                min: yAxis.minValue, // Use the dynamic min value
                max: yAxis.maxValue, // Use the dynamic max value
                ticks: {
                    stepSize: yAxis.stepSize, // Use the dynamic step size
                },
                grid: {
                    display: true,
                    color: 'rgba(200, 200, 200, 0.5)', // Color of grid lines
                },
            },
        },
    };

    // In the render section:
    <Line ref={chartRef} data={{ labels, datasets }} options={chartOptions} />

    const Modal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white rounded-lg p-6 max-w-lg mx-auto relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                    >
                        &times;
                    </button>
                    {children}
                </div>
            </div>
        );
    };

    const handleShowDetails = () => {
        setIsModalOpen(true);  // Modal opening action
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Modal closing action
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= Math.ceil(agricultureData.length / rowsPerPage)) {
            setCurrentPage(page);
        }
    };

    const handleLineClick = () => {
        setActiveGraph('line');
    };

    const handleMapClick = () => {
        setActiveGraph('map');
    };

    const downloadGraph = () => {
        const chart = chartRef.current;
        if (chart) {
            const link = document.createElement('a');
            link.href = chart.toBase64Image();
            link.download = `${selectedCountry}_line_graph.png`; // Use selected country in the filename
            link.click();
        }
    };


    return (
        <>
            <Helmet>
                <title>Agriculture Data</title>
            </Helmet>
            <div className="w-full p-5 md:p-0">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">Agricultural land (% of land area)</h1>
                    <p className='text-sm text-gray-400 mb-4'>Food and Agriculture Organization, electronic files and web site. This Dataset was gotten from World Bank</p>

                    {error && <div className="text-red-500 mt-4">{error}</div>}

                    {agricultureData.length > 0 && !loading && (
                        <>
                            <div className="mb-4">
                                <label className="mr-2" htmlFor="country-selector">Select Country:</label>
                                <select
                                    id="country-selector"
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    className="border rounded p-2"
                                >
                                    <option value="">World</option> {/* Default option for World */}
                                    {countries.map(country => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {years.length > 0 && (
                                <div className="mb-8">
                                    <div className="bg-white rounded-lg shadow-md p-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center mb-4">
                                                <p onClick={handleLineClick} className={`cursor-pointer mr-4 font-bold relative ${activeGraph === 'line' ? 'text-green-500' : ''}`}>
                                                    Line
                                                    {activeGraph === 'line' && <span className="absolute left-0 bottom-[-5px] w-full h-[2px] bg-green-500" />}
                                                </p>
                                                <p onClick={handleMapClick} className={`cursor-pointer font-bold relative ${activeGraph === 'map' ? 'text-green-500' : ''}`}>
                                                    Map
                                                    {activeGraph === 'map' && <span className="absolute left-0 bottom-[-5px] w-full h-[2px] bg-green-500" />}
                                                </p>
                                            </div>
                                            <div className="flex justify-between mb-4">
                                                <button onClick={downloadGraph} className="mr-4 font-bold">
                                                    Download
                                                </button>
                                                <button onClick={handleShowDetails} className="font-bold">
                                                    Show Details
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative z-0 w-full h-[300px] md:h-[400px] lg:h-[500px] mb-4">
                                            {activeGraph === 'line' ? (
                                                <Line ref={chartRef} data={lineChartData()} options={chartOptions} />
                                            ) : (
                                                <div className="h-full overflow-auto">
                                                    <MapComponent theData={agricultureData} />
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )}

                            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] rounded-lg shadow-lg overflow-y-auto p-6 mt-24 relative"> {/* Added "relative" for positioning */}

                                        {/* Close button */}
                                        <button
                                            onClick={handleCloseModal}
                                            className="absolute top-4 right-4 text-md text-gray-500 hover:text-gray-800"
                                        >
                                            &times;
                                        </button>

                                        <h2 className="text-xl font-bold mb-2">Agricultural Land (% of Land Area)</h2>
                                        <p className="mb-4">
                                            Agricultural land refers to the share of land area that is arable, under permanent crops, and under permanent pastures. Arable land includes land defined by the FAO as land under temporary crops (double-cropped areas are counted once), temporary meadows for mowing or for pasture, land under market or kitchen gardens, and land temporarily fallow. Land abandoned as a result of shifting cultivation is excluded. Land under permanent crops is cultivated with crops that occupy the land for long periods and need not be replanted after each harvest, such as cocoa, coffee, and rubber. This category includes land under flowering shrubs, fruit trees, nut trees, and vines, but excludes land under trees grown for wood or timber. Permanent pasture is land used for five or more years for forage, including natural and cultivated crops.
                                        </p>
                                        <p><strong>ID:</strong> AG.LND.AGRI.ZS</p>
                                        <p><strong>Source:</strong> Food and Agriculture Organization, electronic files and web site</p>
                                        <p><strong>License:</strong> <a href="https://datacatalog.worldbank.org/public-licenses?_gl=1*1akcz9f*_gcl_au*MjAwMjIyNTU4Ny4xNzI2MjkzOTg2#cc-by" target="_blank" rel="noopener noreferrer" className="text-blue-500">CC BY-4.0</a></p>
                                        <p><strong>Aggregation Method:</strong> Weighted average</p>
                                        <p><strong>Development Relevance:</strong> Agricultural land covers more than one-third of the world's land area, with arable land representing less than one-third of agricultural land (about 10 percent of the world's land area). Agricultural land constitutes only a part of any country's total area, which can include areas not suitable for agriculture, such as forests, mountains, and inland water bodies. FAO's agricultural land data contains a wide range of information significant for understanding the structure of a country's agricultural sector, making economic plans and policies for food security, deriving environmental indicators, and forming policies for agricultural sustainability.</p>
                                        <p><strong>Limitations and Exceptions:</strong> The data are collected by the FAO from official national sources through annual questionnaires and supplemented with secondary data sources. Standard definitions and reporting methods are imposed, but complete consistency across countries and over time is not always possible. For example, permanent pastures in African countries differ from those in dry Middle Eastern countries. Also, agricultural employment data may be inaccurate in countries where much of the work is informal, and large amounts are performed by women and children. These and other concerns are addressed by extensive footnoting in the data.</p>
                                        <p><strong>Long Definition:</strong> Agricultural land refers to the share of land area that is arable, under permanent crops, and under permanent pastures. Arable land includes land under temporary crops, temporary meadows, land under market or kitchen gardens, and land temporarily fallow. Permanent crops include cocoa, coffee, and rubber. Permanent pasture is used for five or more years for forage.</p>
                                        <p><strong>Periodicity:</strong> Annual</p>
                                        <p><strong>Statistical Concept and Methodology:</strong> Agriculture plays a major role in the economies of many developing countries, but poor practices can degrade land resources. Excessive use of chemical fertilizers, pesticides, and intensive irrigation can negatively impact soil chemistry and health. Data on agricultural land are valuable for analyzing agricultural production, food security, and environmental sustainability.</p>
                                        <p><strong>Topic:</strong> Environment: Land Use</p>
                                        <p><strong>All Metadata:</strong> <a href="https://databank.worldbank.org/reports.aspx?source=2&type=metadata&series=AG.LND.AGRI.ZS&_gl=1*1akcz9f*_gcl_au*MjAwMjIyNTU4Ny4xNzI2MjkzOTg2" target="_blank" rel="noopener noreferrer" className="text-blue-500">View Full Metadata</a></p>
                                    </div>
                                </div>
                            </Modal>


                            <div className="mb-8">
                                <h2 className="text-sm sm:text- overflow-x-hidden font-semibold mb-2 mt-5">Data Table</h2>
                                <div className="bg-white shadow-md rounded-lg p-4 w-[450px] md:w-[500px] max-w-4xl mx-auto">
                                    <div className="overflow-x-auto">
                                        <div className="max-h-[400px] overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country Name</th>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country Code</th>
                                                        <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator Name</th>
                                                        {years.map(year => (
                                                            <th key={year} className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year {year}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {currentRows.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Country_Name"]}</td>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Country_Code"]}</td>
                                                            <td className="px-2 md:px-4 py-2 whitespace-nowrap">{item["Indicator_Name"]}</td>
                                                            {years.map(year => (
                                                                <td key={year} className="px-2 md:px-4 py-2 whitespace-nowrap">{item[`Year_${year}`] || 0}</td>
                                                            ))}
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
                                        disabled={currentPage === Math.ceil(agricultureData.length / rowsPerPage)}
                                        className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                                    >
                                        Next
                                    </button>
                                </div>
                                <CSVLink
                                    data={agricultureData}
                                    filename={"agriculture_data.csv"}
                                    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600"
                                >
                                    Download CSV
                                </CSVLink>
                            </div>
                        </>
                    )}


                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
                        </div>
                    )}

                    {!loading && agricultureData.length === 0 && (
                        <p>No data available at the moment.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default AgriculturePage;
