import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';
import Papa from 'papaparse'; // CSV parsing library

function AdminPage() {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTableName, setNewTableName] = useState('');
    const [columns, setColumns] = useState([{ name: '', type: 'VARCHAR(255)' }]);
    const [file, setFile] = useState(null); // For storing the uploaded file

    // Fetch tables on component mount
    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://ganzbe.onrender.com/tables');
            setTables(response.data);
            toast.success('Tables fetched successfully!');
        } catch (error) {
            console.error('Error fetching tables:', error);
            toast.error('Failed to fetch tables.');
        } finally {
            setLoading(false);
        }
    };

    const handleTableSelection = (tableName) => {
        setSelectedTable(tableName);
        if (tableName) {
            setEditing(true);
            fetchTableData(tableName);
        } else {
            setEditing(false);
            setTableData([]);
        }
    };

    const fetchTableData = async (tableName) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://ganzbe.onrender.com/table-data/${tableName}`);
            setTableData(response.data);
            toast.success(`Data for table "${tableName}" fetched successfully!`);
        } catch (error) {
            console.error('Error fetching table data:', error);
            toast.error('Failed to fetch table data.');
        } finally {
            setLoading(false);
        }
    };

    const handleDataChange = (rowIndex, columnName, value) => {
        const updatedTableData = [...tableData];
        updatedTableData[rowIndex][columnName] = value;
        setTableData(updatedTableData);
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            await axios.put(`https://ganzbe.onrender.com/${selectedTable}`, {
                updates: tableData
            });
            toast.success('Table data updated successfully!');
        } catch (error) {
            console.error('Error updating table data:', error);
            toast.error('Failed to update table data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async () => {
        if (!newTableName.trim()) {
            toast.error('Table name cannot be empty.');
            return;
        }
        if (columns.some(col => !col.name.trim())) {
            toast.error('Column names cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('https://ganzbe.onrender.com/create-table', {
                tableName: newTableName,
                columns
            });
            toast.success('Table created successfully!');
            setCreating(false);
            setNewTableName('');
            setColumns([{ name: '', type: 'VARCHAR(255)' }]);
            fetchTables();
        } catch (error) {
            console.error('Error creating table:', error);
            toast.error('Failed to create table.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTable = async () => {
        if (!selectedTable) return;

        if (window.confirm(`Are you sure you want to delete the table "${selectedTable}"?`)) {
            setLoading(true);
            try {
                await axios.delete(`https://ganzbe.onrender.com/delete-table/${selectedTable}`);
                toast.success('Table deleted successfully!');
                setSelectedTable('');
                setEditing(false);
                setTableData([]);
                fetchTables();
            } catch (error) {
                console.error('Error deleting table:', error);
                toast.error('Failed to delete table.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleColumnChange = (index, event) => {
        const { name, value } = event.target;
        const updatedColumns = [...columns];
        updatedColumns[index][name] = value;
        setColumns(updatedColumns);
    };

    const addColumn = () => {
        setColumns([...columns, { name: '', type: 'VARCHAR(255)' }]);
    };

    const removeColumn = (index) => {
        if (columns.length === 1) {
            toast.error('At least one column is required.');
            return;
        }
        const updatedColumns = columns.filter((_, colIndex) => colIndex !== index);
        setColumns(updatedColumns);
    };

    // Handle file selection
    const handleFileChange = (event) => {
        console.log('File selected:', event.target.files[0]);
        setFile(event.target.files[0]);
    };
    
    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload.');
            return;
        }
    
        console.log('Uploading file:', file);
        
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const csvData = e.target.result;
            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        // Send the parsed data to the backend
                        await axios.post(`https://ganzbe.onrender.com/upload/${selectedTable}`, {
                            data: results.data
                        });
                        toast.success('Data uploaded successfully!');
                        fetchTableData(selectedTable); // Refresh table data after upload
                    } catch (error) {
                        console.error('Error uploading data:', error);
                        toast.error('Failed to upload data.');
                    }
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                    toast.error('Failed to parse CSV file.');
                }
            });
        };
    
        reader.readAsText(file);
    };
    
    
    return (
        <div className="max-w-4xl mx-auto p-4">
            <ToastContainer />
            <h1 className="text-3xl font-bold mb-6">Admin Page</h1>

            {/* Table Selection */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Select Table</h2>
                <select
                    value={selectedTable}
                    onChange={(e) => handleTableSelection(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full mb-4"
                >
                    <option value="">Select a table</option>
                    {tables.map((table, index) => (
                        <option key={index} value={table}>{table}</option>
                    ))}
                </select>
                <button
                    onClick={handleDeleteTable}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:bg-red-300"
                    disabled={!selectedTable || loading}
                >
                    Delete Table
                </button>
            </div>

            {/* Create Table Section */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Create New Table</h2>
                <button
                    onClick={() => setCreating(!creating)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
                >
                    {creating ? 'Cancel' : 'Create Table'}
                </button>
                {creating && (
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Table name"
                            value={newTableName}
                            onChange={(e) => setNewTableName(e.target.value)}
                            className="p-2 border border-gray-300 rounded w-full mb-4"
                        />
                        {columns.map((col, index) => (
                            <div key={index} className="mb-4 flex items-center">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Column name"
                                    value={col.name}
                                    onChange={(e) => handleColumnChange(index, e)}
                                    className="p-2 border border-gray-300 rounded mr-2 flex-1"
                                />
                                <select
                                    name="type"
                                    value={col.type}
                                    onChange={(e) => handleColumnChange(index, e)}
                                    className="p-2 border border-gray-300 rounded mr-2"
                                >
                                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                                    <option value="INT">INT</option>
                                    <option value="FLOAT">FLOAT</option>
                                    <option value="DATE">DATE</option>
                                    <option value="BOOLEAN">BOOLEAN</option>
                                    <option value="TEXT">TEXT</option>
                                </select>
                                <button
                                    onClick={() => removeColumn(index)}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addColumn}
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mb-4"
                        >
                            Add Column
                        </button>
                        <button
                            onClick={handleCreateTable}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            Create Table
                        </button>
                    </div>
                )}
            </div>

            {/* Data Table */}
            {editing && (
                <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Edit Table Data</h2>
                    {loading && <ClipLoader size={40} />}
                    <table className="w-full border-collapse border border-gray-200">
                        <thead>
                            <tr>
                                {tableData[0] && Object.keys(tableData[0]).map((key) => (
                                    <th key={key} className="border border-gray-300 p-2">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Object.keys(row).map((key) => (
                                        <td key={key} className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                value={row[key]}
                                                onChange={(e) => handleDataChange(rowIndex, key, e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={handleSaveChanges}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4"
                    >
                        Save Changes
                    </button>
                </div>
            )}

            {/* File Upload Section */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Upload Data</h2>
                <input
                    type="file"
                    accept=".sql,.csv"
                    onChange={handleFileChange}
                    className="mb-4"
                />
                <button
                    onClick={handleUpload}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    disabled={loading}
                >
                    Upload File
                </button>
            </div>
        </div>
    );
}

export default AdminPage;
