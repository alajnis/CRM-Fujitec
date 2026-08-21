import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C8102E] to-red-800 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
          <span className="font-black text-white text-5xl">F</span>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fujitec CRM
          </h1>
          <p className="text-sm text-white/80 font-semibold">
            Cargando sistema...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/80 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
};
