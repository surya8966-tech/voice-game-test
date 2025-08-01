import React, { useState, useEffect, useRef, useCallback } from 'react';

function App() {
  const [falconX, setFalconX] = useState(50); // Falcon horizontal position (pixels)
  const [falconY, setFalconY] = useState(50); // Falcon vertical position (percentage)
  const [falconVelocityY, setFalconVelocityY] = useState(0); // Vertical velocity
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isScreaming, setIsScreaming] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'gameOver'
  const [micPermission, setMicPermission] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  const GAME_WIDTH = 800; // Game area width in pixels
  const GAME_HEIGHT = 400; // Game area height in pixels
  const GRAVITY = 0.8;
  const FORWARD_SPEED = 3; // Speed when screaming
  const VOLUME_THRESHOLD = 30; // Adjust this value to change sensitivity

  // Initialize Audio Context and Microphone
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission(false);
      return false;
    }
  }, []);

  // Analyze audio volume
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    setVolumeLevel(average);
    
    // Check if screaming (volume above threshold)
    if (average > VOLUME_THRESHOLD) {
      setIsScreaming(true);
    } else {
      setIsScreaming(false);
    }
    
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [gameState]);

  // Game physics loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    
    // Handle horizontal movement (forward when screaming)
    if (isScreaming) {
      setFalconX(prevX => {
        const newX = prevX + FORWARD_SPEED;
        // Keep falcon within game bounds
        return Math.min(newX, GAME_WIDTH - 50);
      });
    }
    
    // Handle vertical movement (gravity when not screaming)
    if (!isScreaming) {
      setFalconVelocityY(prev => prev + GRAVITY);
    } else {
      // Reduce falling when screaming (but don't completely stop gravity)
      setFalconVelocityY(prev => Math.max(prev - 1, 0));
    }
    
    // Apply vertical velocity
    setFalconY(prevY => {
      const newY = prevY + falconVelocityY;
      
      // Check boundaries
      if (newY <= 0) {
        setFalconVelocityY(0);
        return 0;
      }
      if (newY >= 85) {
        // Game over - hit ground
        setGameState('gameOver');
        return prevY;
      }
      
      return Math.max(0, Math.min(85, newY));
    });
    
    // Increase distance and score based on forward movement
    setDistance(prev => prev + (isScreaming ? 2 : 0));
    if (distance % 50 === 0 && distance > 0) {
      setScore(prev => prev + 10);
    }
    
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, isScreaming, falconVelocityY, distance]);

  // Start game loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Start game with audio analysis
  const startGame = async () => {
    const audioInitialized = await initializeAudio();
    if (!audioInitialized) {
      alert('Microphone permission is required to play this game. Please allow microphone access and try again.');
      return;
    }
    
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setFalconX(50);
    setFalconY(50);
    setFalconVelocityY(0);
    setIsListening(true);
    
    // Start audio analysis
    analyzeAudio();
  };

  // Stop game
  const stopGame = () => {
    setGameState('ready');
    setIsListening(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Stop microphone
    if (microphoneRef.current && microphoneRef.current.mediaStream) {
      microphoneRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }
  };

  // Restart game
  const restartGame = () => {
    stopGame();
    setTimeout(() => startGame(), 100);
  };

  // Render different screens based on game state
  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">🦅</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📢 Scream Go Hero</h1>
            <p className="text-gray-600 mb-6">Scream to make your falcon fly forward! Stay quiet and it falls down. Don't hit the ground!</p>
          </div>
          
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg mb-4 w-full"
          >
            Start Screaming!
          </button>
          
          {micPermission === false && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ⚠️ Microphone permission denied. Please allow microphone access to play.
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            <p>💡 Tip: Scream, shout, or make loud noises to fly forward!</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">💥</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h1>
            <p className="text-gray-600 mb-4">
              Your falcon crashed! You flew {Math.floor(distance / 10)} meters and scored {score} points.
            </p>
          </div>
          
          <button
            onClick={restartGame}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
          >
            Scream Again!
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 relative overflow-hidden">
      {/* Clouds background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-white text-4xl opacity-30">☁️</div>
        <div className="absolute top-32 right-20 text-white text-3xl opacity-40">☁️</div>
        <div className="absolute top-48 left-1/3 text-white text-5xl opacity-25">☁️</div>
        <div className="absolute bottom-32 right-10 text-white text-4xl opacity-35">☁️</div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📢 Scream Go Hero</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isListening ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isListening ? 'Listening' : 'Not Listening'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-600">Score</p>
              <p className="text-lg font-bold text-blue-600">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Distance</p>
              <p className="text-lg font-bold text-green-600">{Math.floor(distance / 10)}m</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Volume</p>
              <div className="flex items-center justify-center">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-red-500 transition-all duration-100"
                    style={{ width: `${Math.min(volumeLevel * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={stopGame}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            >
              Stop Game
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative z-10 px-4">
        <div 
          className="bg-transparent relative border-2 border-white border-opacity-30 rounded-lg mx-auto"
          style={{ height: `${GAME_HEIGHT}px`, width: `${GAME_WIDTH}px` }}
        >
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-600 rounded-b-lg">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-700 rounded-b-lg"></div>
          </div>
          
          {/* Falcon */}
          <div 
            className="absolute transition-all duration-100 ease-out transform"
            style={{ 
              left: `${falconX}px`,
              top: `${falconY}%`,
              transform: `rotate(${isScreaming ? -10 : 10}deg) ${isScreaming ? 'scale(1.1)' : 'scale(1)'}`,
            }}
          >
            <div className={`text-5xl transition-all duration-100 ${
              isScreaming ? 'animate-pulse' : ''
            }`}>
              🦅
            </div>
          </div>
          
          {/* Position indicators */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            X: {Math.round(falconX)}px | Y: {Math.round(falconY)}%
          </div>
          
          {/* Scream indicator */}
          {isScreaming && (
            <div className="absolute left-1/4 top-1/4 transform -translate-y-1/2">
              <div className="text-yellow-400 text-3xl animate-ping">📢</div>
            </div>
          )}
          
          {/* Volume indicator */}
          {volumeLevel > VOLUME_THRESHOLD && (
            <div className="absolute right-4 top-4">
              <div className="text-red-500 text-2xl animate-bounce">🔊</div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="relative z-10 text-center p-4">
        <div className="bg-white bg-opacity-90 rounded-lg p-4 max-w-lg mx-auto">
          <h3 className="font-bold text-gray-800 mb-2">How to Play:</h3>
          <div className="text-sm text-gray-700">
            <p><strong>📢 SCREAM:</strong> Falcon flies forward without falling</p>
            <p><strong>🤫 QUIET:</strong> Falcon falls due to gravity</p>
            <p><strong>🎯 GOAL:</strong> Fly as far as possible without hitting the ground!</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Make loud noises: shout, whistle, clap, or scream to keep flying!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
