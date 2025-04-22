import React, { useState } from 'react';

const Tooltip = ({ text, position = 'top', children, className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute whitespace-nowrap px-2 py-1 text-sm text-white bg-black rounded shadow-lg ${
            position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' : ''
          } ${
            position === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' : ''
          } ${
            position === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' : ''
          } ${
            position === 'right' ? 'left-full ml-2 top-1/2 transform -translate-y-1/2' : ''
          }`}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;