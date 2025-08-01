import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [falconY, setFalconY] = useState(0); // Falcon vertical position (pixels)
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animationFrameRef = useRef(null);
  const falconSpeedRef = useRef(1.5); // Default speed = 1.5px per frame

  const GAME_HEIGHT = 600; // Game area height in pixels

  // Animation function using requestAnimationFrame
  const animate = () => {
    setFalconY(prevY => {
      const newY = prevY + falconSpeedRef.current;
      
      // Reset position if falcon reaches bottom
      if (newY >= GAME_HEIGHT - 50) {
        return 0; // Reset to top
      }
      
      return newY;
    });
    
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // Start animation
  const startAnimation = () => {
    setIsAnimating(true);
    setFalconY(0);
  };

  // Stop animation
  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Effect to handle animation start/stop
  useEffect(() => {
    if (isAnimating) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800">🦅 Surr - Falling Falcon</h2>
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <span className="font-medium">Speed: {falconSpeedRef.current}px/frame</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            >
              {isAnimating ? 'Running...' : 'Start Animation'}
            </button>
            <button
              onClick={stopAnimation}
              disabled={!isAnimating}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            >
              Stop Animation
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 px-4">
        <div 
          className="bg-transparent relative border-2 border-white border-opacity-30 rounded-lg mx-auto"
          style={{ height: `${GAME_HEIGHT}px`, width: '400px' }}
        >
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-600 rounded-b-lg">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-700 rounded-b-lg"></div>
          </div>
          
          {/* Falcon */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 transition-none"
            style={{ 
              top: `${falconY}px`,
            }}
          >
            <div className="text-4xl">
              🦅
            </div>
          </div>
          
          {/* Position indicator */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            Y: {Math.round(falconY)}px
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="relative z-10 text-center p-4">
        <div className="bg-white bg-opacity-90 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-gray-700 text-sm">
            🦅 The falcon falls at 1.5px per frame using requestAnimationFrame.<br/>
            It resets to the top when it reaches the bottom.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
