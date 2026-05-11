import React from 'react';

/**
 * AIAvatar component
 * A futuristic, pulsing orb that visualizes the AI's state (Speaking, Listening, or Idle).
 */
export default function AIAvatar({ state = 'idle', size = 'medium' }) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  const stateColors = {
    idle: 'from-blue-600/20 to-purple-600/20 shadow-blue-500/10',
    speaking: 'from-red-600/40 to-orange-600/40 shadow-red-500/30 animate-pulse-fast',
    listening: 'from-green-600/40 to-emerald-600/40 shadow-emerald-500/30 animate-pulse-slow'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Outer Glow Ring */}
      <div className={`absolute inset-0 rounded-full blur-[40px] transition-all duration-700 bg-gradient-to-br ${stateColors[state]}`} />
      
      {/* Middle Core Ring */}
      <div className="absolute inset-2 rounded-full border border-white/10 backdrop-blur-3xl overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-tr ${stateColors[state]} opacity-40 transition-opacity duration-700`} />
        
        {/* Core Detail Lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-full h-[1px] bg-white rotate-45" />
          <div className="w-full h-[1px] bg-white -rotate-45" />
          <div className="h-full w-[1px] bg-white" />
        </div>
      </div>

      {/* Center Sphere */}
      <div className="relative w-[30%] h-[30%] rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 transition-transform duration-500 scale-100 group-hover:scale-110">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-50" />
      </div>

      {/* State Text (Floating Below) */}
      <div className="absolute -bottom-12 w-full text-center">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">
          {state === 'idle' ? 'AI System Standby' : state === 'speaking' ? 'AI Synthesizing...' : 'User Listening...'}
        </p>
      </div>
    </div>
  );
}
