import React, { useState, useEffect } from 'react';

/**
 * TransitionScreen Component
 * Beautiful page transition with spinning ring and logo animation
 *
 * @param {object} props
 * @param {boolean} props.isVisible - Controls visibility of transition screen
 */
const TransitionScreen = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationClass('opacity-100');
    } else {
      setAnimationClass('opacity-0 pointer-events-none');
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center transition-opacity duration-500 ${animationClass}`}>
      <div className="relative flex flex-col items-center justify-center p-8">

        {/* Animation Container */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">

          {/* The Elegant Ring - Spinning */}
          <div className="absolute inset-0 rounded-full animate-orbit">
            <div className="w-full h-full rounded-full border-[2px] border-transparent border-t-orange-500 border-r-blue-600 border-b-orange-500/30 border-l-blue-600/30 shadow-[0_0_15px_rgba(234,88,12,0.3)]"></div>
          </div>

          {/* The Logo - Scale In */}
          <div className="absolute z-10 w-32 h-32 flex items-center justify-center animate-pop-in">
            <img
              src="/logo.png"
              alt="Vanguard"
              className="w-full h-full object-contain drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'text-6xl font-black text-white';
                fallback.textContent = 'V';
                e.target.parentNode.appendChild(fallback);
              }}
            />
          </div>
        </div>

        {/* Text Reveal */}
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase drop-shadow-lg">
            VANGUARD
          </h2>
          <p className="text-sm font-bold text-orange-500 tracking-[0.35em] uppercase mt-2 animate-pulse">
            SPORTS ACADEMY
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransitionScreen;
