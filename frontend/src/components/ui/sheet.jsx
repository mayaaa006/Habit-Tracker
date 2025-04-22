import React from 'react';

const Sheet = ({ 
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'default',
  ...props
}) => {
  if (!isOpen) return null;
  
  const baseStyles = "fixed z-50 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out";
  
  const positionStyles = {
    right: "top-0 right-0 h-full",
    left: "top-0 left-0 h-full", 
    top: "top-0 left-0 w-full",
    bottom: "bottom-0 left-0 w-full",
  };
  
  const sizeStyles = {
    sm: position === 'top' || position === 'bottom' ? 'h-1/4' : 'w-64',
    default: position === 'top' || position === 'bottom' ? 'h-1/3' : 'w-80',
    lg: position === 'top' || position === 'bottom' ? 'h-1/2' : 'w-96',
    xl: position === 'top' || position === 'bottom' ? 'h-2/3' : 'w-1/3',
    full: position === 'top' || position === 'bottom' ? 'h-screen' : 'w-screen',
  };
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={`${baseStyles} ${positionStyles[position]} ${sizeStyles[size]}`}
        {...props}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sheet;