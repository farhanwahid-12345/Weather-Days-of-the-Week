import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { format } from 'date-fns';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/button';

export const GameHeader: React.FC = () => {
  const time = useGameStore(state => state.time);
  const finances = useGameStore(state => state.finances);
  const gameSettings = useGameStore(state => state.gameSettings);
  const updateGameSettings = useGameStore(state => state.updateGameSettings);
  const setTime = useGameStore(state => state.setTime);
  const calculateNetWorth = useGameStore(state => state.calculateNetWorth);

  const netWorth = calculateNetWorth();

  const toggleSound = () => {
    updateGameSettings({ sound: !gameSettings.sound });
  };

  const resetTime = () => {
    setTime(new Date('2024-01-01'));
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">UK Property Tycoon</h1>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Time:</span>
            <span className="text-sm font-semibold dark:text-white">{format(time, 'dd MMM yyyy HH:mm')}</span>
            <Button variant="outline" size="sm" onClick={resetTime}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6 flex-wrap justify-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Cash:</span>
            <span className="text-sm font-semibold text-green-600">
              £{(finances.cash / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Net Worth:</span>
            <span className="text-sm font-semibold text-purple-600">
              £{(netWorth / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
            >
              {gameSettings.sound ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateGameSettings({ 
                speed: gameSettings.speed === 1 ? 2 : gameSettings.speed === 2 ? 4 : 1 
              })}
            >
              Speed: {gameSettings.speed}x
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
