import React from 'react';

const LoadingSpinner = ({ mensaje = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in duration-700">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-flavis-gold border-r-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse">🍪</span>
        </div>
      </div>
      
      <p className="mt-6 text-flavis-blue/60 dark:text-white/40 font-main italic text-lg tracking-tighter">
        {mensaje}
      </p>
    </div>
  );
};

export default LoadingSpinner;