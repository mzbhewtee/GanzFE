import React, { useState } from 'react';
import axios from 'axios';

function AdminPage() {
    const [tableName, setTableName] = useState('');
    const [columns, setColumns] = useState([]);
    const [oldColumnName, setOldColumnName] = useState('');
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState('');
    const [deleteTableName, setDeleteTableName] = useState('');

    const handleAddColumn = () => {
        setColumns([...columns, { name: '', type: '' }]);
    };

    const handleColumnChange = (index, field, value) => {
        const newColumns = [...columns];
        newColumns[index][field] = value;
        setColumns(newColumns);
    };

    const handleAddTable = () => {
        axios.post('https://ganzbe.onrender.com/add-table', {
            tableName,
            columns
        })
        .then(response => {
            alert(response.data);
            setTableName('');
            setColumns([]);
        })
        .catch(error => {
            console.error('Error adding table:', error);
            alert('Failed to add table');
        });
    };

    const handleEditTable = () => {
        axios.put('https://ganzbe.onrender.com/edit-table', {
            tableName,
            oldColumnName,
            newColumnName,
            newType: newColumnType
        })
        .then(response => {
            alert(response.data);
            setTableName('');
            setOldColumnName('');
            setNewColumnName('');
            setNewColumnType('');
        })
        .catch(error => {
            console.error('Error editing table:', error);
            alert('Failed to edit table');
        });
    };

    const handleDeleteTable = () => {
        axios.delete('https://ganzbe.onrender.com/delete-table', {
            data: { tableName: deleteTableName }
        })
        .then(response => {
            alert(response.data);
            setDeleteTableName('');
        })
        .catch(error => {
            console.error('Error deleting table:', error);
            alert('Failed to delete table');
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Admin Page</h1>

            {/* Add Table Section */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Add Table</h2>
                <input 
                    type="text" 
                    placeholder="Table Name" 
                    value={tableName}
                    onChange={e => setTableName(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <div className="mb-4">
                    {columns.map((column, index) => (
                        <div key={index} className="flex gap-4 mb-2">
                            <input 
                                type="text" 
                                placeholder="Column Name" 
                                value={column.name}
                                onChange={e => handleColumnChange(index, 'name', e.target.value)}
                                className="p-2 border border-gray-300 rounded w-full"
                            />
                            <input 
                                type="text" 
                                placeholder="Column Type" 
                                value={column.type}
                                onChange={e => handleColumnChange(index, 'type', e.target.value)}
                                className="p-2 border border-gray-300 rounded w-full"
                            />
                        </div>
                    ))}
                    <button 
                        onClick={handleAddColumn}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Add Column
                    </button>
                </div>
                <button 
                    onClick={handleAddTable}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                    Add Table
                </button>
            </div>

            {/* Edit Table Section */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Edit Table</h2>
                <input 
                    type="text" 
                    placeholder="Table Name" 
                    value={tableName}
                    onChange={e => setTableName(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <input 
                    type="text" 
                    placeholder="Old Column Name" 
                    value={oldColumnName}
                    onChange={e => setOldColumnName(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <input 
                    type="text" 
                    placeholder="New Column Name" 
                    value={newColumnName}
                    onChange={e => setNewColumnName(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <input 
                    type="text" 
                    placeholder="New Column Type" 
                    value={newColumnType}
                    onChange={e => setNewColumnType(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <button 
                    onClick={handleEditTable}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                >
                    Edit Table
                </button>
            </div>

            {/* Delete Table Section */}
            <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Delete Table</h2>
                <input 
                    type="text" 
                    placeholder="Table Name to Delete" 
                    value={deleteTableName}
                    onChange={e => setDeleteTableName(e.target.value)}
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <button 
                    onClick={handleDeleteTable}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                    Delete Table
                </button>
            </div>
        </div>
    );
}

export default AdminPage;
