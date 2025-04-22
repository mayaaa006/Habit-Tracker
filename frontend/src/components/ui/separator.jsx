import React from 'react';

const Separator = ({ 
  orientation = 'horizontal',
  className = '',
  ...props 
}) => {
  const baseStyles = "bg-gray-200 dark:bg-gray-700";
  
  const orientationStyles = {
    horizontal: "w-full h-px my-6",
    vertical: "h-full w-px mx-6",
  };
  
  return (
    <div 
      className={`${baseStyles} ${orientationStyles[orientation]} ${className}`}
      role="separator"
      {...props}
    />
  );
};

export default Separator;