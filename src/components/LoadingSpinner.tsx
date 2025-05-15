import React from 'react';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-[#3f4c6b] animate-spin"></div>
        <div className="absolute top-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-[#2c3e50] animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute top-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-[#1a2533] animate-spin" style={{ animationDuration: '2s' }}></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;