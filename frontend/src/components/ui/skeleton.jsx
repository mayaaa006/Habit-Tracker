import React from 'react';

const Skeleton = ({ 
  variant = 'rectangle',
  width,
  height,
  className = '',
  ...props 
}) => {
  const baseStyles = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantStyles = {
    rectangle: "",
    circle: "rounded-full",
    text: "h-4 rounded",
  };
  
  const sizeStyles = {};
  if (width) sizeStyles.width = width;
  if (height) sizeStyles.height = height;
  
  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={sizeStyles}
      {...props}
    />
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(lines).fill(0).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? 'w-4/5' : 'w-full'} 
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <Skeleton variant="rectangle" height="150px" />
      <SkeletonText lines={2} />
    </div>
  );
};

export default Skeleton;