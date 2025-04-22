import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import useMobile from '../../hooks/use-mobile';

const SidebarUI = ({ 
  children,
  logo,
  footer,
  className = '',
  ...props
}) => {
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
          onClick={toggleSidebar}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          h-screen bg-pink-200 dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isMobile ? 'fixed top-0 left-0 z-40 w-64' : 'w-64'}
          ${className}
        `}
        {...props}
      >
        {/* Logo/Header */}
        {logo && (
          <div className="p-4">
            {logo}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-pink-300 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
      
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default SidebarUI;