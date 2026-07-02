import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './stores/gameStore';
import { GameHeader } from './features/GameHeader';
import { MarketPage } from './features/MarketPage';
import { BankingPage } from './features/BankingPage';
import { AccountsPage } from './features/AccountsPage';

function App() {
  const incrementTime = useGameStore(state => state.incrementTime);
  const refreshMarket = useGameStore(state => state.refreshMarket);
  const gameSettings = useGameStore(state => state.gameSettings);

  useEffect(() => {
    // Initialize market properties
    refreshMarket();
    
    // Set up game clock interval
    const intervalId = setInterval(() => {
      incrementTime(3 * gameSettings.speed); // 3 game seconds per real second at 1x speed
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [incrementTime, refreshMarket, gameSettings.speed]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <GameHeader />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/market" />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/bank" element={<BankingPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
