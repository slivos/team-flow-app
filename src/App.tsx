import { useState } from 'react';
import { Board } from './components/Board';
import { Header } from './components/Header';
import { Settings } from './components/Settings';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <Board />
      {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default App;
