import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import logo from '../assets/logo.png';

function Navbar() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Custom formatting function
    const formatDate = (date) => {
        const optionsDate = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        const optionsTime = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        };

        return `${date.toLocaleDateString('en-US', optionsDate)} ${date.toLocaleTimeString('en-US', optionsTime)}`;
    };

    return (
        <div className="flex h-20 flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
                <div className="mx-auto max-w-screen-xl px-5 py-7 flex items-center justify-between">
                    <Link to="/" className="text-lg font-semibold cursor-pointer flex items-center"> {/* Change to Link */}
                        <img src={logo} alt="Logo" className="h-12 mr-2" />
                    </Link>
                    <div className="text-green-900 text-sm md:text-md cursor-pointer"> {/* Added cursor-pointer */}
                        <Link to="/admin"> {/* Wrap the date in a Link */}
                            <span>{formatDate(currentTime)}</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
