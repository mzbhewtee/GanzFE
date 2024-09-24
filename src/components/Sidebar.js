import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GlobeEuropeAfricaIcon,
  CloudIcon,
  ServerIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export function Sidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation(); // Get the current location

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <>
      {/* Burger Menu Button */}
      <button
        className="fixed top-28 right-4 z-50 p-2 bg-black rounded-md md:hidden"
        onClick={toggleDrawer}
      >
        {isDrawerOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-24 inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transition-transform ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-64 md:bg-white md:text-gray-900 md:shadow-md top-32`}
      >
        <div className="flex flex-col h-full p-4">
          <ul className="space-y-2 md:space-y-4">
            <SidebarItem
              href="/"
              icon={<HomeIcon className="h-5 w-5" />}
              isActive={location.pathname === '/'}
            >
              Home
            </SidebarItem>
            <SidebarItem
              href="/land"
              icon={<GlobeEuropeAfricaIcon className="h-5 w-5" />}
              isActive={location.pathname === '/land'}
            >
              Land
            </SidebarItem>
            <SidebarItem
              href="/climate"
              icon={<CloudIcon className="h-5 w-5" />}
              isActive={location.pathname === '/climate'}
            >
              Climate
            </SidebarItem>
            <SidebarItem
              href="/agriculture"
              icon={<ServerIcon className="h-5 w-5" />}
              isActive={location.pathname === '/agriculture'}
            >
              Agriculture
            </SidebarItem>
            
          </ul>
        </div>
      </div>
    </>
  );
}

function SidebarItem({ href, icon, children, isActive }) {
  return (
    <li className={`flex items-center p-2 rounded-md ${isActive ? 'bg-gray-700 md:bg-gray-100' : 'hover:bg-gray-700 md:hover:bg-gray-100'} cursor-pointer`}>
      <Link to={href} className="flex items-center w-full">
        {icon}
        <span className="ml-3">{children}</span>
      </Link>
    </li>
  );
}
