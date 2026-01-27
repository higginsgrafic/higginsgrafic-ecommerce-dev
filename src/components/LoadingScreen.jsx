import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {/* Spinner circular negre sobre blanc */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
            <div className="w-16 h-16 border-4 border-foreground rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
          </div>
        </div>

        {/* Text de càrrega */}
        <p className="mt-6 text-foreground text-sm font-medium">
          Carregant...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
