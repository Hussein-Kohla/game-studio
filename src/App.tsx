import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './pages/HomePage';
import { Game1Setup } from './pages/game1/Game1Setup';
import { Game1Board } from './pages/game1/Game1Board';
import { Game1Challenge } from './pages/game1/Game1Challenge';
import { Game2Setup } from './pages/game2/Game2Setup';
import { Game2Play } from './pages/game2/Game2Play';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-50 font-cairo" dir="rtl">
        <Navbar />
        <main className="flex-grow flex flex-col relative overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Game 1 Routes */}
            <Route path="/game1/setup" element={<Game1Setup />} />
            <Route path="/game1/board" element={<Game1Board />} />
            <Route path="/game1/challenge" element={<Game1Challenge />} />
            
            {/* Game 2 Routes */}
            <Route path="/game2/setup" element={<Game2Setup />} />
            <Route path="/game2/play" element={<Game2Play />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#111827',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }} />
    </BrowserRouter>
  );
}

export default App;
