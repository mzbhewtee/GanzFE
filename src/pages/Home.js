import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');

    const dataSections = [
        {
            title: 'Climate Data',
            description: 'Explore historical and recent climate data with detailed visualizations.',
            link: '/climate',
        },
        {
            title: 'Land Data',
            description: 'Analyze land-related information, including size and parcel counts.',
            link: '/land',
        },
        {
            title: 'Agriculture Data',
            description: 'Explore key agricultural metrics, including crop production and more.',
            link: '/agriculture',
        },
    ];

    const filteredSections = dataSections.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row">
            <main className="flex-1 p-4 md:p-8 lg:p-12">
                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                </div>

                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-green-900 mb-4">Welcome to the Dashboard</h1>
                    <p className="text-gray-700">Explore various data categories and stay updated with the latest information available on the platform.</p>
                </div>

                {/* Data Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {filteredSections.length > 0 ? (
                        filteredSections.map((section, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h2 className="text-xl font-semibold text-green-900 mb-2">{section.title}</h2>
                                <p className="text-gray-600">{section.description}</p>
                                <Link to={section.link} className="text-green-600 hover:underline mt-4 inline-block">
                                    View {section.title}
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-700">No results found for "{searchQuery}".</p>
                    )}
                </div>

                {/* Recent Updates Section */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-green-900 mb-2">Recent Updates</h2>
                    <p className="text-gray-600">Stay informed about the latest updates and important changes in the data.</p>
                    <ul className="list-disc list-inside mt-4 text-gray-700">
                        <li className="mb-2">Update 1: New data added for climate trends.</li>
                        <li className="mb-2">Update 2: Land parcel sizes have been revised.</li>
                        {/* Add more updates as needed */}
                    </ul>
                </div>
            </main>
        </div>
    );
}
