import React from 'react';

const Alert = ({ type = 'error', message, onClose }) => {
  const styles = {
    error: 'bg-red-100 border-red-400 text-red-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  };

  if (!message) return null;

  return (
    <div className={`border-l-4 p-4 mb-4 ${styles[type]}`} role="alert">
      <div className="flex justify-between items-center">
        <p>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-xl font-bold hover:opacity-75"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
